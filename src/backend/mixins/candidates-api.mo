import CandidateTypes "../types/candidates";
import AdminTypes "../types/admin";
import AuthLib "../lib/AuthLib";
import CandidateLib "../lib/CandidateLib";
import Map "mo:core/Map";

mixin (
  candidates : Map.Map<Text, CandidateTypes.Candidate>,
  candidateTokens : Map.Map<Text, Text>,
  candidatePasscodes : Map.Map<Text, AdminTypes.Admin>,
  candidateSessions : Map.Map<Text, Text>,
) {
  public func createCandidate(
    email : Text,
    name : Text,
    department : Text,
    designation : Text,
  ) : async { #ok : CandidateTypes.Candidate; #err : Text } {
    switch (CandidateLib.createCandidate(candidates, candidateTokens, email, name, department, designation)) {
      case (#ok(candidate)) {
        // Store passcode in candidatePasscodes map for login validation
        let passcodeRecord : AdminTypes.Admin = {
          email = candidate.email;
          passwordHash = candidate.passcode;
        };
        candidatePasscodes.add(candidate.email, passcodeRecord);
        #ok(candidate)
      };
      case (#err(msg)) { #err(msg) };
    }
  };

  public func getCandidates() : async [CandidateTypes.Candidate] {
    CandidateLib.getCandidates(candidates)
  };

  public func getCandidateByEmail(email : Text) : async ?CandidateTypes.Candidate {
    CandidateLib.getCandidateByEmail(candidates, email)
  };

  public func getCandidateByToken(token : Text) : async ?CandidateTypes.Candidate {
    CandidateLib.getCandidateByToken(candidates, candidateTokens, token)
  };

  public func candidateLogin(email : Text, passcode : Text) : async { #ok : Text; #err : Text } {
    // Check if interview already completed
    switch (candidates.get(email)) {
      case null { return #err("Candidate not found") };
      case (?c) {
        if (c.status == "Completed") {
          return #err("Interview already completed. You cannot log in again.")
        };
      };
    };
    AuthLib.candidateLogin(candidatePasscodes, candidateSessions, email, passcode)
  };

  public func validateCandidateSession(token : Text) : async ?Text {
    AuthLib.validateCandidateSession(candidateSessions, token)
  };

  public func syncFromSheets(sheetCandidates : [CandidateTypes.SheetCandidate]) : async { #ok : Nat; #err : Text } {
    let result = CandidateLib.syncFromSheets(candidates, candidateTokens, sheetCandidates);
    // Sync passcodes for new candidates
    switch (result) {
      case (#ok(_)) {
        // Rebuild passcodes map for all candidates that exist in candidates but not in passcodes
        for ((email, c) in candidates.entries()) {
          switch (candidatePasscodes.get(email)) {
            case null {
              let passcodeRecord : AdminTypes.Admin = {
                email = c.email;
                passwordHash = c.passcode;
              };
              candidatePasscodes.add(email, passcodeRecord);
            };
            case (?_) {};
          };
        };
      };
      case (#err(_)) {};
    };
    result
  };

  public func getCandidatesForSync() : async [CandidateTypes.Candidate] {
    CandidateLib.getCandidates(candidates)
  };
};
