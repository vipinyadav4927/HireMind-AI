import InterviewTypes "../types/interviews";
import CandidateTypes "../types/candidates";
import Map "mo:core/Map";
import Time "mo:core/Time";
import AuthLib "AuthLib";

module {
  public type InterviewSession = InterviewTypes.InterviewSession;
  public type EvaluationResult = InterviewTypes.EvaluationResult;
  public type Candidate = CandidateTypes.Candidate;

  public func createInterviewSession(
    sessions : Map.Map<Text, InterviewSession>,
    candidates : Map.Map<Text, Candidate>,
    candidateEmail : Text,
  ) : { #ok : InterviewSession; #err : Text } {
    switch (candidates.get(candidateEmail)) {
      case null { #err("Candidate not found") };
      case (?candidate) {
        if (candidate.status == "Completed") {
          return #err("Interview already completed");
        };
        let sessionId = AuthLib.generateToken();
        let session : InterviewSession = {
          sessionId;
          candidateEmail;
          questions = [];
          currentQuestionIndex = 0;
          tabSwitchCount = 0;
          startedAt = Time.now();
          completedAt = null;
          status = "active";
        };
        sessions.add(sessionId, session);
        #ok(session)
      };
    }
  };

  public func getInterviewSession(sessions : Map.Map<Text, InterviewSession>, sessionId : Text) : ?InterviewSession {
    sessions.get(sessionId)
  };

  public func updateTabSwitchCount(
    sessions : Map.Map<Text, InterviewSession>,
    sessionId : Text,
  ) : { #ok : Nat; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.status != "active") {
          return #err("Session is not active");
        };
        let newCount = session.tabSwitchCount + 1;
        let newStatus = if (newCount >= 5) "auto_ended" else "active";
        let updated : InterviewSession = {
          session with
          tabSwitchCount = newCount;
          status = newStatus;
        };
        sessions.add(sessionId, updated);
        #ok(newCount)
      };
    }
  };

  public func completeInterview(
    sessions : Map.Map<Text, InterviewSession>,
    candidates : Map.Map<Text, Candidate>,
    sessionId : Text,
    evaluation : EvaluationResult,
    audioLinks : [Text],
  ) : { #ok; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        let now = Time.now();
        let updatedSession : InterviewSession = {
          session with
          status = "completed";
          completedAt = ?now;
        };
        sessions.add(sessionId, updatedSession);

        switch (candidates.get(session.candidateEmail)) {
          case null { #err("Candidate not found") };
          case (?candidate) {
            let firstAudio : ?Text = if (audioLinks.size() > 0) ?audioLinks[0] else null;
            let updatedCandidate : Candidate = {
              candidate with
              status = "Completed";
              score = ?evaluation.score;
              strengths = ?evaluation.strengths;
              weaknesses = ?evaluation.weaknesses;
              audioLink = firstAudio;
              interviewDate = ?now;
            };
            candidates.add(candidate.email, updatedCandidate);
            #ok
          };
        }
      };
    }
  };
};
