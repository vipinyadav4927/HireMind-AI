import Common "common";

module {
  public type Timestamp = Common.Timestamp;

  public type InterviewSession = {
    sessionId : Text;
    candidateEmail : Text;
    questions : [Text];
    currentQuestionIndex : Nat;
    tabSwitchCount : Nat;
    startedAt : Timestamp;
    completedAt : ?Timestamp;
    status : Text;
  };

  public type EvaluationResult = {
    score : Nat;
    technicalRating : Nat;
    communicationRating : Nat;
    confidenceRating : Nat;
    strengths : Text;
    weaknesses : Text;
    recommendation : Text;
  };
};
