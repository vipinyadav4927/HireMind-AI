import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Candidate = {
    id : Text;
    email : Text;
    name : Text;
    department : Text;
    designation : Text;
    status : Text;
    score : ?Nat;
    strengths : ?Text;
    weaknesses : ?Text;
    audioLink : ?Text;
    passcode : Text;
    createdAt : Timestamp;
    interviewDate : ?Timestamp;
  };

  // Used for Google Sheets sync ingestion
  public type SheetCandidate = {
    email : Text;
    name : Text;
    department : Text;
    designation : Text;
    status : Text;
    score : ?Nat;
    strengths : ?Text;
    weaknesses : ?Text;
    audioLink : ?Text;
  };
};
