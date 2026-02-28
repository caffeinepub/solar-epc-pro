import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";

actor {
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
    lastUpdated : Time.Time;
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
    timestamp : Time.Time;
    details : Text;
  };

  module AuditEntry {
    public func compare(a1 : AuditEntry, a2 : AuditEntry) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  // Persistent storage
  let projects = Map.empty<Nat, Project>();
  let appliances = Map.empty<Nat, Appliance>();
  let moqItems = Map.empty<Nat, MOQItem>();
  let brands = Map.empty<Nat, Brand>();
  let inventory = Map.empty<Nat, InventoryItem>();
  let quotations = Map.empty<Nat, Quotation>();
  let users = Map.empty<Nat, User>();
  let auditLog = Map.empty<Nat, AuditEntry>();

  // ID generators
  var nextProjectId = 1;
  var nextApplianceId = 1;
  var nextMOQId = 1;
  var nextBrandId = 1;
  var nextInventoryId = 1;
  var nextQuotationId = 1;
  var nextUserId = 1;
  var nextAuditId = 1;

  // Project functions
  public shared ({ caller }) func createProject(clientName : Text, systemType : { #onGrid; #offGrid; #hybrid }, installationType : { #rccRooftop; #sheetMetal; #groundMount; #other }, loadInputMethod : { #consumptionBased; #applianceBased }, systemSizeKW : Float, batteryCapacityKWh : Float) : async Nat {
    let id = nextProjectId;
    nextProjectId += 1;
    let project : Project = {
      id;
      clientName;
      systemType;
      installationType;
      loadInputMethod;
      systemSizeKW;
      batteryCapacityKWh;
      status = #draft;
    };
    projects.add(id, project);
    id;
  };

  public query ({ caller }) func listProjects() : async [Project] {
    projects.values().toArray().sort();
  };

  // Appliance functions
  public shared ({ caller }) func addAppliance(projectId : Nat, name : Text, wattage : Float, surgeFactor : Float, dailyHours : Float, quantity : Nat) : async Nat {
    if (not projects.containsKey(projectId)) {
      Runtime.trap("Project does not exist");
    };
    let id = nextApplianceId;
    nextApplianceId += 1;
    let appliance : Appliance = {
      id;
      projectId;
      name;
      wattage;
      surgeFactor;
      dailyHours;
      quantity;
    };
    appliances.add(id, appliance);
    id;
  };

  // MOQ functions
  public query ({ caller }) func listMOQ(projectId : Nat) : async [MOQItem] {
    moqItems.values().toArray().filter(func(m) { m.projectId == projectId }).sort();
  };

  public shared ({ caller }) func updateMOQItem(id : Nat, quantity : Float, unitPrice : Float) : async () {
    switch (moqItems.get(id)) {
      case (null) { Runtime.trap("MOQ item does not exist") };
      case (?item) {
        let updatedItem : MOQItem = {
          item with quantity; unitPrice;
          totalPrice = quantity * unitPrice;
        };
        moqItems.add(id, updatedItem);
      };
    };
  };

  // Brand functions
  public shared ({ caller }) func createBrand(category : Text, name : Text, isActive : Bool) : async Nat {
    let id = nextBrandId;
    nextBrandId += 1;
    let brand : Brand = {
      id;
      category;
      name;
      isActive;
    };
    brands.add(id, brand);
    id;
  };

  public query ({ caller }) func listBrands() : async [Brand] {
    brands.values().toArray().sort();
  };

  // Inventory functions
  public shared ({ caller }) func createInventoryItem(sku : Text, name : Text, category : Text, quantityOnHand : Nat, minStock : Nat, unit : Text, warehouseLocation : Text) : async Nat {
    let id = nextInventoryId;
    nextInventoryId += 1;
    let item : InventoryItem = {
      id;
      sku;
      name;
      category;
      quantityOnHand;
      minStock;
      unit;
      warehouseLocation;
      lastUpdated = Time.now();
    };
    inventory.add(id, item);
    id;
  };

  public query ({ caller }) func listInventory() : async [InventoryItem] {
    inventory.values().toArray().sort();
  };

  // Quotation functions
  public shared ({ caller }) func createQuotation(proposalNumber : Text, clientName : Text, companyName : Text, gst : Float, totalCost : Float, subsidy : Float, paybackYears : Float, annualSavings : Float, irr : Float, carbonSavings : Float, status : QuotationStatus, termsAndConditions : Text) : async Nat {
    let id = nextQuotationId;
    nextQuotationId += 1;
    let quotation : Quotation = {
      id;
      proposalNumber;
      clientName;
      companyName;
      gst;
      totalCost;
      subsidy;
      paybackYears;
      annualSavings;
      irr;
      carbonSavings;
      status;
      termsAndConditions;
    };
    quotations.add(id, quotation);
    id;
  };

  public query ({ caller }) func listQuotations() : async [Quotation] {
    quotations.values().toArray().sort();
  };

  // User functions
  public shared ({ caller }) func createUser(name : Text, email : Text, role : UserRole, isActive : Bool) : async Nat {
    let id = nextUserId;
    nextUserId += 1;
    let user : User = {
      id;
      name;
      email;
      role;
      isActive;
    };
    users.add(id, user);
    id;
  };

  public query ({ caller }) func listUsers() : async [User] {
    users.values().toArray().sort();
  };

  // Audit log functions
  public shared ({ caller }) func addAuditEntry(action : Text, performedBy : Nat, targetEntity : Text, details : Text) : async () {
    let id = nextAuditId;
    nextAuditId += 1;
    let entry : AuditEntry = {
      id;
      action;
      performedBy;
      targetEntity;
      timestamp = Time.now();
      details;
    };
    auditLog.add(id, entry);
  };

  public shared ({ caller }) func getAuditLog() : async [AuditEntry] {
    auditLog.values().toArray().sort();
  };
};
