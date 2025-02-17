module rally::vehicle_telemetry {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_VIN: u64 = 2;
    const EINVALID_TIMESTAMP: u64 = 3;
    const EINVALID_DATA: u64 = 4;
    const ECONTRACT_NOT_INITIALIZED: u64 = 5;

    /// Constants for data validation
    const MAX_LAT: u64 = 90;
    const MIN_LAT: u64 = -90;
    const MAX_LONG: u64 = 180;
    const MIN_LONG: u64 = -180;
    const MAX_BATTERY_LEVEL: u64 = 100;

    /// Represents vehicle location data
    struct Location has store, drop, copy {
        latitude: u64,
        longitude: u64,
        timestamp: u64
    }

    /// Represents vehicle charge state
    struct ChargeState has store, drop, copy {
        battery_level: u64,
        charging_status: u8,
        estimated_range: u64,
        timestamp: u64
    }

    /// Represents a complete vehicle telemetry record
    struct VehicleTelemetry has store {
        vin: String,
        location: Location,
        charge_state: ChargeState,
        last_updated: u64,
        data_provider: address,
        signature: vector<u8>
    }

    /// Event for new telemetry data
    struct TelemetryUpdateEvent has store, drop {
        vin: String,
        timestamp: u64,
        data_provider: address
    }

    /// Resource struct to store authorized data providers
    struct AuthorizedProviders has key {
        providers: Table<address, bool>
    }

    /// Resource struct to store vehicle telemetry data
    struct TelemetryStore has key {
        telemetry_data: Table<String, VehicleTelemetry>,
        update_events: EventHandle<TelemetryUpdateEvent>
    }

    /// Initialize the contract
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        assert!(!exists<AuthorizedProviders>(admin_addr), error::already_exists(ECONTRACT_NOT_INITIALIZED));
        assert!(!exists<TelemetryStore>(admin_addr), error::already_exists(ECONTRACT_NOT_INITIALIZED));

        let providers = table::new<address, bool>();
        move_to(admin, AuthorizedProviders { providers });

        let telemetry_data = table::new<String, VehicleTelemetry>();
        let update_events = account::new_event_handle<TelemetryUpdateEvent>(admin);
        move_to(admin, TelemetryStore { 
            telemetry_data,
            update_events
        });
    }

    /// Add an authorized data provider
    public entry fun add_provider(
        admin: &signer,
        provider: address
    ) acquires AuthorizedProviders {
        let admin_addr = signer::address_of(admin);
        assert!(exists<AuthorizedProviders>(admin_addr), error::not_found(ECONTRACT_NOT_INITIALIZED));

        let providers = &mut borrow_global_mut<AuthorizedProviders>(admin_addr).providers;
        table::upsert(providers, provider, true);
    }

    /// Submit vehicle telemetry data
    public entry fun submit_telemetry(
        provider: &signer,
        vin: String,
        latitude: u64,
        longitude: u64,
        battery_level: u64,
        charging_status: u8,
        estimated_range: u64,
        signature: vector<u8>
    ) acquires AuthorizedProviders, TelemetryStore {
        let provider_addr = signer::address_of(provider);
        
        // Verify provider is authorized
        let providers = &borrow_global<AuthorizedProviders>(@rally).providers;
        assert!(table::contains(providers, provider_addr), error::permission_denied(ENOT_AUTHORIZED));

        // Validate input data
        assert!(battery_level <= MAX_BATTERY_LEVEL, error::invalid_argument(EINVALID_DATA));
        assert!(latitude <= MAX_LAT && latitude >= MIN_LAT, error::invalid_argument(EINVALID_DATA));
        assert!(longitude <= MAX_LONG && longitude >= MIN_LONG, error::invalid_argument(EINVALID_DATA));

        let current_time = timestamp::now_microseconds();
        
        // Create telemetry record
        let telemetry = VehicleTelemetry {
            vin: vin,
            location: Location {
                latitude,
                longitude,
                timestamp: current_time
            },
            charge_state: ChargeState {
                battery_level,
                charging_status,
                estimated_range,
                timestamp: current_time
            },
            last_updated: current_time,
            data_provider: provider_addr,
            signature
        };

        // Store telemetry data
        let store = borrow_global_mut<TelemetryStore>(@rally);
        table::upsert(&mut store.telemetry_data, vin, telemetry);

        // Emit update event
        event::emit_event(&mut store.update_events, TelemetryUpdateEvent {
            vin: vin,
            timestamp: current_time,
            data_provider: provider_addr
        });
    }

    /// Get latest vehicle telemetry data
    public fun get_telemetry(
        vin: String
    ): (Location, ChargeState, u64, address) acquires TelemetryStore {
        let store = borrow_global<TelemetryStore>(@rally);
        assert!(table::contains(&store.telemetry_data, vin), error::not_found(EINVALID_VIN));

        let telemetry = table::borrow(&store.telemetry_data, vin);
        (
            telemetry.location,
            telemetry.charge_state,
            telemetry.last_updated,
            telemetry.data_provider
        )
    }

    /// Verify data signature
    public fun verify_signature(
        telemetry: &VehicleTelemetry,
        public_key: vector<u8>
    ): bool {
        // TODO: Implement signature verification using ed25519 or similar
        // This would verify that the data was signed by an authorized provider
        true
    }

    #[test]
    fun test_initialization() {
        // Test contract initialization
        let admin = account::create_account_for_test(@rally);
        initialize(&admin);
        
        assert!(exists<AuthorizedProviders>(@rally), 1);
        assert!(exists<TelemetryStore>(@rally), 1);
    }
}
