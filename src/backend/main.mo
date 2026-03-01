import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Migration "migration";

(with migration = Migration.run)
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

  public shared ({ caller }) func addMOQItem(projectId : Nat, itemName : Text, category : Text, quantity : Float, unit : Text, brand : Text, unitPrice : Float) : async Nat {
    if (not projects.containsKey(projectId)) {
      Runtime.trap("Project does not exist");
    };
    let id = nextMOQId;
    nextMOQId += 1;
    let moq : MOQItem = {
      id;
      projectId;
      itemName;
      category;
      quantity;
      unit;
      brand;
      unitPrice;
      totalPrice = quantity * unitPrice;
    };
    moqItems.add(id, moq);
    id;
  };

  public shared ({ caller }) func deleteMOQItem(id : Nat) : async () {
    if (not moqItems.containsKey(id)) {
      Runtime.trap("MOQ item does not exist");
    };
    moqItems.remove(id);
  };

  public shared ({ caller }) func updateMOQItem(id : Nat, itemName : Text, category : Text, quantity : Float, unit : Text, brand : Text, unitPrice : Float) : async () {
    switch (moqItems.get(id)) {
      case (null) { Runtime.trap("MOQ item does not exist") };
      case (?item) {
        let updatedItem : MOQItem = {
          item with itemName; category; quantity; unit; brand; unitPrice;
          totalPrice = quantity * unitPrice;
        };
        moqItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func generateMOQ(projectId : Nat) : async () {
    let project = switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };

    for (item in moqItems.values()) {
      if (item.projectId == projectId) {
        moqItems.remove(item.id);
      };
    };

    let kw = project.systemSizeKW;
    let panelQty = Float.ceil(kw * 1000.0 / 540.0);
    let strings = Float.ceil(panelQty / 8.0);

    let needsBattery = switch (project.systemType) {
      case (#offGrid) { true };
      case (#hybrid) { true };
      case (#onGrid) { false };
    };

    let battKWh = if (needsBattery) {
      if (project.batteryCapacityKWh > 0.0) { project.batteryCapacityKWh } else {
        kw * 2.0;
      };
    } else { 0.0 };

    let battQty = if (needsBattery) { Float.ceil(battKWh / 2.4) } else { 0.0 };
    let dcCableM = strings * 30.0 + 20.0;
    let inverterPrice = kw * 8000.0;

    let insertItem = func(cat : Text, name : Text, qty : Float, unit : Text, price : Float) {
      let id = nextMOQId;
      nextMOQId += 1;
      moqItems.add(id, {
        id;
        projectId;
        itemName = name;
        category = cat;
        quantity = qty;
        unit;
        brand = "";
        unitPrice = price;
        totalPrice = qty * price;
      });
    };

    insertItem("Solar PV", "Solar Panel 540 Wp Mono PERC", panelQty, "Nos", 22000.0);
    insertItem("Solar PV", "Solar Inverter", 1.0, "Nos", inverterPrice);

    if (needsBattery) {
      insertItem("Battery Bank", "VRLA Battery 200Ah 12V", battQty, "Nos", 14000.0);
      insertItem("Battery Bank", "Battery Cable Set", Float.ceil(battQty / 2.0), "Set", 500.0);
    };

    insertItem("Electrical BoS", "DCDB", 1.0, "Nos", 3500.0);
    insertItem("Electrical BoS", "ACDB", 1.0, "Nos", 2800.0);
    insertItem("Electrical BoS", "DC SPD Type II", 2.0, "Nos", 1200.0);
    insertItem("Electrical BoS", "AC SPD Type II", 1.0, "Nos", 900.0);
    insertItem("Electrical BoS", "DC MCB 32A", strings + 1.0, "Nos", 350.0);
    insertItem("Electrical BoS", "AC MCB 63A", 1.0, "Nos", 450.0);
    insertItem("Electrical BoS", "DC Isolator 1000V", strings, "Nos", 800.0);
    insertItem("Electrical BoS", "Changeover Switch 63A", 1.0, "Nos", 1200.0);
    insertItem("Electrical BoS", "Chemical Earthing Kit", 2.0, "Set", 2500.0);
    insertItem("Electrical BoS", "Lightning Arrester", 1.0, "Nos", 1800.0);

    insertItem("Cabling", "DC Solar Cable 6sqmm Red", Float.ceil(dcCableM / 2.0), "Mtr", 35.0);
    insertItem("Cabling", "DC Solar Cable 6sqmm Black", Float.ceil(dcCableM / 2.0), "Mtr", 35.0);
    insertItem("Cabling", "AC Power Cable 4sqmm", 30.0, "Mtr", 28.0);
    insertItem("Cabling", "Earthing Cable 16sqmm", 20.0, "Mtr", 45.0);
    insertItem("Cabling", "Conduit Pipe 25mm", Float.ceil(dcCableM / 3.0), "Nos", 85.0);
    insertItem("Cabling", "Cable Tie Pack 100pcs", 3.0, "Pkt", 120.0);
    insertItem("Cabling", "MC4 Connector Pair", strings * 2.0 + 4.0, "Pair", 180.0);
    insertItem("Cabling", "Cable Gland Set", 1.0, "Set", 450.0);
    insertItem("Cabling", "Ferrules and Markers Set", 1.0, "Set", 280.0);

    switch (project.installationType) {
      case (#rccRooftop) { insertItem("Mounting Structure", "MS Aluminium Rooftop Structure", panelQty, "Nos", 4000.0) };
      case (#sheetMetal) { insertItem("Mounting Structure", "GI Roof Hook MS Channel Structure", panelQty, "Nos", 3500.0) };
      case (#groundMount) { insertItem("Mounting Structure", "MS Ground Mount Structure", panelQty, "Nos", 6500.0) };
      case (#other) { insertItem("Mounting Structure", "Aluminium Elevated Structure", panelQty, "Nos", 8000.0) };
    };

    insertItem("Mounting Structure", "Mounting Rail 40x40mm 3m", Float.ceil(panelQty * 2.0 / 3.0), "Nos", 380.0);
    insertItem("Mounting Structure", "End Clamp Set", panelQty * 2.0, "Nos", 55.0);
    insertItem("Mounting Structure", "Mid Clamp Set", panelQty, "Nos", 45.0);
    insertItem("Mounting Structure", "Nut Bolt Washer Set 50pcs", Float.ceil(panelQty / 10.0), "Pkt", 350.0);

    insertItem("Miscellaneous", "Junction Box IP65", strings + 1.0, "Nos", 320.0);
    insertItem("Miscellaneous", "Warning Label Set", 1.0, "Set", 150.0);
    insertItem("Miscellaneous", "Danger Board Acrylic", 2.0, "Nos", 220.0);
    insertItem("Miscellaneous", "Installation Consumables", 1.0, "Set", 850.0);
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
