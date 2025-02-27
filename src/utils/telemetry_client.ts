import {
  AptosClient,
  AptosAccount,
  BCS,
  HexString
} from "aptos";
import { ed25519 } from "@noble/curves/ed25519";
import * as dotenv from "dotenv";
import protobuf from "protobufjs";

dotenv.config();

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1"; // Replace with actual deployed address

const client = new AptosClient(NODE_URL);

class TeslaTelemetryClient {
  private client: AptosClient;
  private account: AptosAccount;
  private contractAddress: string;

  constructor(client: AptosClient, account: AptosAccount, contractAddress: string) {
    this.client = client;
    this.account = account;
    this.contractAddress = contractAddress;
  }


  private signTelemetryData(data: any): Uint8Array {
    const serializedData = BCS.bcsToBytes(data);
    return ed25519.sign(serializedData, this.account.signingKey.secretKey);
  }

  async submitTelemetry(
    vin: string,
    latitude: number,
    longitude: number,
    batteryLevel: number,
    chargingStatus: number,
    estimatedRange: number
  ) {
    try {
      const telemetryData = {
        vin,
        latitude,
        longitude,
        batteryLevel,
        chargingStatus,
        estimatedRange,
        timestamp: Date.now()
      };
      const signature = this.signTelemetryData(telemetryData);

      const latitudeFixed = Math.floor(latitude * 1e7);
      const longitudeFixed = Math.floor(longitude * 1e7);

      const payload = {
        type: "entry_function_payload",
        function: `${this.contractAddress}::vehicle_telemetry::submit_telemetry`,
        type_arguments: [],
        arguments: [
          vin,
          latitudeFixed,
          longitudeFixed,
          Math.floor(batteryLevel),
          chargingStatus,
          Math.floor(estimatedRange),
          Array.from(signature)
        ]
      };

      const txnRequest = await this.client.generateTransaction(
        this.account.address(),
        payload
      );
      const signedTxn = await this.client.signTransaction(this.account, txnRequest);
      const txnResult = await this.client.submitTransaction(signedTxn);

      await this.client.waitForTransaction(txnResult.hash);

      return txnResult.hash;
    } catch (error) {
      console.error("Error submitting telemetry:", error);
      throw error;
    }
  }

  async processProtobufTelemetry(protobufData: Buffer) {
    try {
      const root = await protobuf.load("telemetry.proto"); // Your protobuf schema
      const TelemetryMessage = root.lookupType("telemetry.vehicle_data.Payload");

      const message = TelemetryMessage.decode(protobufData);
      const data = TelemetryMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
      });

      const telemetry = {
        vin: data.vin,
        batteryLevel: this.findValue(data.data, "BatteryLevel"),
        chargingStatus: this.findValue(data.data, "DetailedChargeState"),
        latitude: this.findLocationValue(data.data, "latitude"),
        longitude: this.findLocationValue(data.data, "longitude"),
        estimatedRange: this.findValue(data.data, "EstBatteryRange")
      };

      return await this.submitTelemetry(
        telemetry.vin,
        telemetry.latitude,
        telemetry.longitude,
        telemetry.batteryLevel,
        telemetry.chargingStatus,
        telemetry.estimatedRange
      );
    } catch (error) {
      console.error("Error processing protobuf data:", error);
      throw error;
    }
  }

  private findValue(data: any[], field: string): number {
    const item = data.find(d => d.key === field);
    return item ? Number(item.value.value) : 0;
  }

  private findLocationValue(data: any[], field: string): number {
    const location = data.find(d => d.key === "Location");
    if (!location || !location.value.locationValue) return 0;
    return Number(location.value.locationValue[field]);
  }
}

async function main() {
  try {
    const account = new AptosAccount(
      HexString.ensure(process.env.PRIVATE_KEY).toUint8Array()
    );

    const telemetryClient = new TeslaTelemetryClient(
      client,
      account,
      CONTRACT_ADDRESS
    );

    const txnHash = await telemetryClient.submitTelemetry(
      "5YJ3E1EA8LF000316",
      37.7749,
      -122.4194,
      85,
      4, // Charging
      280
    );
    console.log("Transaction hash:", txnHash);

    // const protobufData = fs.readFileSync('telemetry.bin');
    // await telemetryClient.processProtobufTelemetry(protobufData);

  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run example
if (require.main === module) {
  main();
}

export { TeslaTelemetryClient };
