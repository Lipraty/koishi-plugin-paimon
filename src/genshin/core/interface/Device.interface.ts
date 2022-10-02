interface DeviceInformation {
    Display: string,
    Product: string,
    Device: string,
    Board: string,
    Model: string,
    BootId: string,
    ProcId: string,
    OSType: string,
    IMEI: string,
    AndroidID: string,
    VendorName: string,
    VendorOSName: string,
    Version: DeviceInformationVerionType
}

interface DeviceInformationVerionType {
    Incremental: number,
    Release: number,
    CodeName: string,
    SDK: number
}