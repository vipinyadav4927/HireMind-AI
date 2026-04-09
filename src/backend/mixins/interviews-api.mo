import InterviewTypes "../types/interviews";
import CandidateTypes "../types/candidates";
import InterviewLib "../lib/InterviewLib";
import Map "mo:core/Map";

mixin (
  interviewSessions : Map.Map<Text, InterviewTypes.InterviewSession>,
  candidates : Map.Map<Text, CandidateTypes.Candidate>,
) {
  public func createInterviewSession(candidateEmail : Text) : async { #ok : InterviewTypes.InterviewSession; #err : Text } {
    InterviewLib.createInterviewSession(interviewSessions, candidates, candidateEmail)
  };

  public func getInterviewSession(sessionId : Text) : async ?InterviewTypes.InterviewSession {
    InterviewLib.getInterviewSession(interviewSessions, sessionId)
  };

  public func updateTabSwitchCount(sessionId : Text) : async { #ok : Nat; #err : Text } {
    InterviewLib.updateTabSwitchCount(interviewSessions, sessionId)
  };

  public func completeInterview(
    sessionId : Text,
    evaluation : InterviewTypes.EvaluationResult,
    audioLinks : [Text],
  ) : async { #ok; #err : Text } {
    InterviewLib.completeInterview(interviewSessions, candidates, sessionId, evaluation, audioLinks)
  };
};
