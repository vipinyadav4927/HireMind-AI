import Types "../types/candidates";
import Map "mo:core/Map";
import Time "mo:core/Time";
import AuthLib "AuthLib";

module {
  public type Candidate = Types.Candidate;
  public type SheetCandidate = Types.SheetCandidate;

  public func createCandidate(
    candidates : Map.Map<Text, Candidate>,
    tokens : Map.Map<Text, Text>,
    email : Text,
    name : Text,
    department : Text,
    designation : Text,
  ) : { #ok : Candidate; #err : Text } {
    switch (candidates.get(email)) {
      case (?_) { #err("Candidate already exists") };
      case null {
        let passcode = AuthLib.generatePasscode();
        let token = AuthLib.generateToken();
        let candidate : Candidate = {
          id = email;
          email;
          name;
          department;
          designation;
          status = "Pending";
          score = null;
          strengths = null;
          weaknesses = null;
          audioLink = null;
          passcode;
          createdAt = Time.now();
          interviewDate = null;
        };
        candidates.add(email, candidate);
        tokens.add(token, email);
        #ok(candidate)
      };
    }
  };

  public func getCandidates(candidates : Map.Map<Text, Candidate>) : [Candidate] {
    candidates.values().toArray()
  };

  public func getCandidateByEmail(candidates : Map.Map<Text, Candidate>, email : Text) : ?Candidate {
    candidates.get(email)
  };

  public func getCandidateByToken(
    candidates : Map.Map<Text, Candidate>,
    tokens : Map.Map<Text, Text>,
    token : Text,
  ) : ?Candidate {
    switch (tokens.get(token)) {
      case null { null };
      case (?email) { candidates.get(email) };
    }
  };

  public func updateCandidate(candidates : Map.Map<Text, Candidate>, candidate : Candidate) : Bool {
    switch (candidates.get(candidate.email)) {
      case null { false };
      case (?_) {
        candidates.add(candidate.email, candidate);
        true
      };
    }
  };

  public func syncFromSheets(
    candidates : Map.Map<Text, Candidate>,
    tokens : Map.Map<Text, Text>,
    sheetCandidates : [SheetCandidate],
  ) : { #ok : Nat; #err : Text } {
    var added : Nat = 0;
    for (sc in sheetCandidates.values()) {
      switch (candidates.get(sc.email)) {
        case (?_) { /* already exists, skip */ };
        case null {
          let passcode = AuthLib.generatePasscode();
          let token = AuthLib.generateToken();
          let candidate : Candidate = {
            id = sc.email;
            email = sc.email;
            name = sc.name;
            department = sc.department;
            designation = sc.designation;
            status = if (sc.status == "") "Pending" else sc.status;
            score = sc.score;
            strengths = sc.strengths;
            weaknesses = sc.weaknesses;
            audioLink = sc.audioLink;
            passcode;
            createdAt = Time.now();
            interviewDate = null;
          };
          candidates.add(sc.email, candidate);
          tokens.add(token, sc.email);
          added += 1;
        };
      };
    };
    #ok(added)
  };
};
