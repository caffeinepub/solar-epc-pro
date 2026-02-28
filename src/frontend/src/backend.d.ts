import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    sku: string;
    name: string;
    unit: string;
    lastUpdated: Time;
    quantityOnHand: bigint;
    minStock: bigint;
    warehouseLocation: string;
    category: string;
}
export interface Quotation {
    id: bigint;
    gst: number;
    irr: number;
    status: QuotationStatus;
    subsidy: number;
    clientName: string;
    paybackYears: number;
    proposalNumber: string;
    totalCost: number;
    carbonSavings: number;
    annualSavings: number;
    termsAndConditions: string;
    companyName: string;
}
export type Time = bigint;
export interface MOQItem {
    id: bigint;
    unit: string;
    projectId: bigint;
    itemName: string;
    quantity: number;
    category: string;
    brand: string;
    unitPrice: number;
    totalPrice: number;
}
export interface User {
    id: bigint;
    name: string;
    role: UserRole;
    isActive: boolean;
    email: string;
}
export interface AuditEntry {
    id: bigint;
    action: string;
    performedBy: bigint;
    timestamp: Time;
    details: string;
    targetEntity: string;
}
export interface Project {
    id: bigint;
    installationType: Variant_sheetMetal_rccRooftop_other_groundMount;
    status: ProjectStatus;
    batteryCapacityKWh: number;
    clientName: string;
    loadInputMethod: Variant_applianceBased_consumptionBased;
    systemSizeKW: number;
    systemType: Variant_hybrid_offGrid_onGrid;
}
export interface Brand {
    id: bigint;
    name: string;
    isActive: boolean;
    category: string;
}
export enum ProjectStatus {
    completed = "completed",
    approved = "approved",
    quoted = "quoted",
    draft = "draft",
    inProgress = "inProgress"
}
export enum QuotationStatus {
    sent = "sent",
    rejected = "rejected",
    accepted = "accepted",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    owner = "owner",
    procurement = "procurement",
    siteEngineer = "siteEngineer"
}
export enum Variant_applianceBased_consumptionBased {
    applianceBased = "applianceBased",
    consumptionBased = "consumptionBased"
}
export enum Variant_hybrid_offGrid_onGrid {
    hybrid = "hybrid",
    offGrid = "offGrid",
    onGrid = "onGrid"
}
export enum Variant_sheetMetal_rccRooftop_other_groundMount {
    sheetMetal = "sheetMetal",
    rccRooftop = "rccRooftop",
    other = "other",
    groundMount = "groundMount"
}
export interface backendInterface {
    addAppliance(projectId: bigint, name: string, wattage: number, surgeFactor: number, dailyHours: number, quantity: bigint): Promise<bigint>;
    addAuditEntry(action: string, performedBy: bigint, targetEntity: string, details: string): Promise<void>;
    createBrand(category: string, name: string, isActive: boolean): Promise<bigint>;
    createInventoryItem(sku: string, name: string, category: string, quantityOnHand: bigint, minStock: bigint, unit: string, warehouseLocation: string): Promise<bigint>;
    createProject(clientName: string, systemType: Variant_hybrid_offGrid_onGrid, installationType: Variant_sheetMetal_rccRooftop_other_groundMount, loadInputMethod: Variant_applianceBased_consumptionBased, systemSizeKW: number, batteryCapacityKWh: number): Promise<bigint>;
    createQuotation(proposalNumber: string, clientName: string, companyName: string, gst: number, totalCost: number, subsidy: number, paybackYears: number, annualSavings: number, irr: number, carbonSavings: number, status: QuotationStatus, termsAndConditions: string): Promise<bigint>;
    createUser(name: string, email: string, role: UserRole, isActive: boolean): Promise<bigint>;
    getAuditLog(): Promise<Array<AuditEntry>>;
    listBrands(): Promise<Array<Brand>>;
    listInventory(): Promise<Array<InventoryItem>>;
    listMOQ(projectId: bigint): Promise<Array<MOQItem>>;
    listProjects(): Promise<Array<Project>>;
    listQuotations(): Promise<Array<Quotation>>;
    listUsers(): Promise<Array<User>>;
    updateMOQItem(id: bigint, quantity: number, unitPrice: number): Promise<void>;
}
