import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Float "mo:core/Float";

module {
  // Types
  type ProjectStatus = {
    #draft;
    #quoted;
    #approved;
    #inProgress;
    #completed;
  };

  type Project = {
    id : Nat;
    clientName : Text;
    systemType : { #onGrid; #offGrid; #hybrid };
    installationType : { #rccRooftop; #sheetMetal; #groundMount; #other };
    loadInputMethod : { #consumptionBased; #applianceBased };
    systemSizeKW : Float;
    batteryCapacityKWh : Float;
    status : ProjectStatus;
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Appliance = {
    id : Nat;
    projectId : Nat;
    name : Text;
    wattage : Float;
    surgeFactor : Float;
    dailyHours : Float;
    quantity : Nat;
  };

  module Appliance {
    public func compare(a1 : Appliance, a2 : Appliance) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  type MOQItem = {
    id : Nat;
    projectId : Nat;
    itemName : Text;
    category : Text;
    quantity : Float;
    unit : Text;
    brand : Text;
    unitPrice : Float;
    totalPrice : Float;
  };

  module MOQItem {
    public func compare(m1 : MOQItem, m2 : MOQItem) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  type Brand = {
    id : Nat;
    category : Text;
    name : Text;
    isActive : Bool;
  };

  module Brand {
    public func compare(b1 : Brand, b2 : Brand) : Order.Order {
      Nat.compare(b1.id, b2.id);
    };
  };

  type InventoryItem = {
    id : Nat;
    sku : Text;
    name : Text;
    category : Text;
    quantityOnHand : Nat;
    minStock : Nat;
    unit : Text;
    warehouseLocation : Text;
    lastUpdated : Int;
  };

  module InventoryItem {
    public func compare(i1 : InventoryItem, i2 : InventoryItem) : Order.Order {
      i1.name.compare(i2.name);
    };
  };

  type QuotationStatus = {
    #draft;
    #sent;
    #accepted;
    #rejected;
  };

  type Quotation = {
    id : Nat;
    proposalNumber : Text;
    clientName : Text;
    companyName : Text;
    gst : Float;
    totalCost : Float;
    subsidy : Float;
    paybackYears : Float;
    annualSavings : Float;
    irr : Float;
    carbonSavings : Float;
    status : QuotationStatus;
    termsAndConditions : Text;
  };

  module Quotation {
    public func compare(q1 : Quotation, q2 : Quotation) : Order.Order {
      Nat.compare(q1.id, q2.id);
    };
  };

  type UserRole = { #owner; #admin; #procurement; #siteEngineer };

  type User = {
    id : Nat;
    name : Text;
    email : Text;
    role : UserRole;
    isActive : Bool;
  };

  module User {
    public func compare(u1 : User, u2 : User) : Order.Order {
      Nat.compare(u1.id, u2.id);
    };
  };

  type AuditEntry = {
    id : Nat;
    action : Text;
    performedBy : Nat;
    targetEntity : Text;
    timestamp : Int;
    details : Text;
  };

  module AuditEntry {
    public func compare(a1 : AuditEntry, a2 : AuditEntry) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  // Old actor type definition
  type OldActor = {
    projects : Map.Map<Nat, Project>;
    appliances : Map.Map<Nat, Appliance>;
    moqItems : Map.Map<Nat, MOQItem>;
    brands : Map.Map<Nat, Brand>;
    inventory : Map.Map<Nat, InventoryItem>;
    quotations : Map.Map<Nat, Quotation>;
    users : Map.Map<Nat, User>;
    auditLog : Map.Map<Nat, AuditEntry>;
    nextProjectId : Nat;
    nextApplianceId : Nat;
    nextMOQId : Nat;
    nextBrandId : Nat;
    nextInventoryId : Nat;
    nextQuotationId : Nat;
    nextUserId : Nat;
    nextAuditId : Nat;
  };

  // New actor type definition
  type NewActor = OldActor;

  // Migration function
  public func run(old : OldActor) : NewActor {
    old;
  };
};
