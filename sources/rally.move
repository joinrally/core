module rally::vehicle_telemetry {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_std::ed25519;

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_VIN: u64 = 2;
    const EINVALID_TIMESTAMP: u64 = 3;
    const EINVALID_DATA: u64 = 4;
    const ECONTRACT_NOT_INITIALIZED: u64 = 5;
    const EINVALID_SIGNATURE: u64 = 6;

    /// Constants for data validation
    const MAX_LAT_VALUE: u64 = 900000000; // 90.0000000 * 10^7 (fixed point)
    const MAX_LONG_VALUE: u64 = 1800000000; // 180.0000000 * 10^7 (fixed point)
    const MAX_BATTERY_LEVEL: u64 = 100;
    const VIN_LENGTH: u64 = 17; // Standard VIN length

    // Scale factor for lat/long (fixed point representation)
    const COORD_SCALE_FACTOR: u64 = 10000000; // 10^7

    /// Represents vehicle location data with signed coordinates
    /// Since Move lacks native signed types, we use separate sign flags
    struct Location has store, drop, copy {
        // Latitude/longitude magnitude as fixed point with 7 decimal places
        // Scaled by 10^7 (e.g. 37.7749 degrees = 377749000)
        latitude_value: u64,
        latitude_is_south: bool, // true = South (negative), false = North (positive)
        longitude_value: u64,
        longitude_is_west: bool, // true = West (negative), false = East (positive)
        timestamp: u64
    }

    /// Represents vehicle charge state
    struct ChargeState has store, drop, copy {
        battery_level: u64,
        charging_status: u8,  // 0 = not charging, 1 = charging, 2 = fast charging, etc.
        estimated_range: u64, // in miles or kilometers
        timestamp: u64
    }

    /// Represents a complete vehicle telemetry record
    struct VehicleTelemetry has store, drop {
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
        providers: Table<address, vector<u8>> // address -> public key mapping
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

        let providers = table::new<address, vector<u8>>();
        move_to(admin, AuthorizedProviders { providers });

        let telemetry_data = table::new<String, VehicleTelemetry>();
        let update_events = account::new_event_handle<TelemetryUpdateEvent>(admin);
        move_to(admin, TelemetryStore { 
            telemetry_data,
            update_events
        });
    }

    /// Add an authorized data provider with their public key
    public entry fun add_provider(
        admin: &signer,
        provider: address,
        public_key: vector<u8>
    ) acquires AuthorizedProviders {
        let admin_addr = signer::address_of(admin);
        assert!(exists<AuthorizedProviders>(admin_addr), error::not_found(ECONTRACT_NOT_INITIALIZED));

        let providers = &mut borrow_global_mut<AuthorizedProviders>(admin_addr).providers;
        table::upsert(providers, provider, public_key);
    }

    /// Validate VIN format
    fun validate_vin(vin: &String): bool {
        // Basic validation: Check length is correct
        let length = string::length(vin);
        if (length != VIN_LENGTH) {
            return false
        };
        
        // Additional validation could be added here
        // - Check for valid VIN characters
        // - Validate check digit
        // - etc.
        
        true
    }

    /// Submit vehicle telemetry data
    public entry fun submit_telemetry(
        provider: &signer,
        vin: String,
        latitude_value: u64,
        latitude_is_south: bool,
        longitude_value: u64,
        longitude_is_west: bool,
        battery_level: u64,
        charging_status: u8,
        estimated_range: u64,
        signature: vector<u8>,
        message: vector<u8> // Message that was signed (concatenated data)
    ) acquires AuthorizedProviders, TelemetryStore {
        let provider_addr = signer::address_of(provider);
        
        // Verify provider is authorized
        let admin_addr = @rally; // Consider making this more flexible
        let providers = &borrow_global<AuthorizedProviders>(admin_addr).providers;
        assert!(table::contains(providers, provider_addr), error::permission_denied(ENOT_AUTHORIZED));

        // Validate VIN
        assert!(validate_vin(&vin), error::invalid_argument(EINVALID_VIN));
        
        // Validate input data
        assert!(battery_level <= MAX_BATTERY_LEVEL, error::invalid_argument(EINVALID_DATA));
        
        // Validate latitude (value must be <= 90 degrees, scaled)
        assert!(latitude_value <= MAX_LAT_VALUE, error::invalid_argument(EINVALID_DATA));
        
        // Validate longitude (value must be <= 180 degrees, scaled)
        assert!(longitude_value <= MAX_LONG_VALUE, error::invalid_argument(EINVALID_DATA));

        let current_time = timestamp::now_microseconds();
        
        // Create telemetry record
        let telemetry = VehicleTelemetry {
            vin: vin,
            location: Location {
                latitude_value,
                latitude_is_south,
                longitude_value,
                longitude_is_west,
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
        
        // Verify signature
        let public_key = *table::borrow(providers, provider_addr);
        assert!(verify_signature(&telemetry, public_key, message), 
                error::invalid_argument(EINVALID_SIGNATURE));

        // Store telemetry data
        let store = borrow_global_mut<TelemetryStore>(admin_addr);
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

    /// Convert coordinate representation to decimal degrees
    /// Returns (degree, decimal) pairs for both lat and long
    public fun convert_coordinates(
        latitude_value: u64, 
        latitude_is_south: bool,
        longitude_value: u64,
        longitude_is_west: bool
    ): (u64, u64, bool, u64, u64, bool) {
        let lat_deg = latitude_value / COORD_SCALE_FACTOR;
        let lat_dec = latitude_value % COORD_SCALE_FACTOR;
        
        let long_deg = longitude_value / COORD_SCALE_FACTOR;
        let long_dec = longitude_value % COORD_SCALE_FACTOR;
        
        (lat_deg, lat_dec, latitude_is_south, long_deg, long_dec, longitude_is_west)
    }

    /// Verify data signature using Aptos ed25519 module
    public fun verify_signature(
        telemetry: &VehicleTelemetry,
        public_key: vector<u8>,
        message: vector<u8>
    ): bool {
        // Convert raw bytes to ed25519 types
        let signature_bytes = telemetry.signature;
        
        // Create ed25519 types from bytes
        if (vector::length(&public_key) == 32 && vector::length(&signature_bytes) == 64) {
            let pk = ed25519::new_unvalidated_public_key_from_bytes(public_key);
            let sig = ed25519::new_signature_from_bytes(signature_bytes);
            
            // First validate the public key
            let validated_key_option = ed25519::public_key_validate(&pk);
            
            // If we have a valid key, verify the signature
            if (option::is_some(&validated_key_option)) {
                ed25519::signature_verify_strict(&sig, &pk, message)
            } else {
                false
            }
        } else {
            false
        }
    }

    #[test]
    fun test_initialization() {
        // Test contract initialization
        let admin = account::create_account_for_test(@rally);
        initialize(&admin);
        
        assert!(exists<AuthorizedProviders>(@rally), 1);
        assert!(exists<TelemetryStore>(@rally), 1);
    }

    #[test]
    fun test_validate_vin() {
        // Valid VIN (17 characters)
        let valid_vin = string::utf8(b"1HGCM82633A123456");
        assert!(validate_vin(&valid_vin), 1);
        
        // Invalid VIN (too short)
        let invalid_vin = string::utf8(b"1HGCM123");
        assert!(!validate_vin(&invalid_vin), 1);
    }
}