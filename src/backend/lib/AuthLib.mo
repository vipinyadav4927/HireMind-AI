import AdminTypes "../types/admin";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

module {
  public type Admin = AdminTypes.Admin;

  // Simple polynomial hash for password using Text.foldLeft
  public func hashPassword(password : Text) : Text {
    let hash = password.foldLeft(
      5381 : Nat,
      func(acc : Nat, c : Char) : Nat {
        let code = Nat.fromNat32(Char.toNat32(c));
        (acc * 33 + code) % 4294967296
      }
    );
    hash.toText() # "_hashed"
  };

  // Generate token from timestamp (nanosecond precision ensures uniqueness per call)
  public func generateToken() : Text {
    let ts = Time.now();
    let t = Int.abs(ts);
    t.toText() # "_tok"
  };

  // Generate 6-digit passcode from timestamp
  public func generatePasscode() : Text {
    let ts = Time.now();
    let t = Int.abs(ts);
    let raw = t % 900000 + 100000;
    raw.toText()
  };

  public func createAdmin(
    admins : Map.Map<Text, Admin>,
    email : Text,
    password : Text,
  ) : { #ok; #err : Text } {
    switch (admins.get(email)) {
      case (?_) { #err("Admin already exists") };
      case null {
        let admin : Admin = {
          email;
          passwordHash = hashPassword(password);
        };
        admins.add(email, admin);
        #ok
      };
    }
  };

  public func ensureDefaultAdmin(admins : Map.Map<Text, Admin>) {
    if (admins.size() == 0) {
      let defaultAdmin : Admin = {
        email = "admin@interviewai.com";
        passwordHash = hashPassword("Admin123!");
      };
      admins.add("admin@interviewai.com", defaultAdmin);
    };
  };

  public func adminLogin(
    admins : Map.Map<Text, Admin>,
    sessions : Map.Map<Text, Text>,
    email : Text,
    password : Text,
  ) : { #ok : Text; #err : Text } {
    ensureDefaultAdmin(admins);
    switch (admins.get(email)) {
      case null { #err("Invalid credentials") };
      case (?admin) {
        if (admin.passwordHash == hashPassword(password)) {
          let token = generateToken();
          // Store token -> expiresAt (as Int text). Email is retrievable from admins map.
          let expiresAt : Int = Time.now() + 8 * 3_600_000_000_000;
          sessions.add(token, expiresAt.toText());
          #ok(token)
        } else {
          #err("Invalid credentials")
        }
      };
    }
  };

  public func adminLogout(sessions : Map.Map<Text, Text>, token : Text) : Bool {
    switch (sessions.get(token)) {
      case null { false };
      case (?_) {
        sessions.remove(token);
        true
      };
    }
  };

  public func validateAdminSession(sessions : Map.Map<Text, Text>, token : Text) : Bool {
    switch (sessions.get(token)) {
      case null { false };
      case (?expiresText) {
        switch (Int.fromText(expiresText)) {
          case null { false };
          case (?expires) { Time.now() < expires };
        }
      };
    }
  };

  public func candidateLogin(
    candidatePasscodes : Map.Map<Text, Admin>,
    sessions : Map.Map<Text, Text>,
    email : Text,
    passcode : Text,
  ) : { #ok : Text; #err : Text } {
    switch (candidatePasscodes.get(email)) {
      case null { #err("Candidate not found") };
      case (?cand) {
        if (cand.passwordHash == passcode) {
          let token = generateToken();
          sessions.add(token, email);
          #ok(token)
        } else {
          #err("Invalid passcode")
        }
      };
    }
  };

  public func validateCandidateSession(sessions : Map.Map<Text, Text>, token : Text) : ?Text {
    sessions.get(token)
  };
};
