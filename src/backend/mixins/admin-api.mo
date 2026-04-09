import AdminTypes "../types/admin";
import AuthLib "../lib/AuthLib";
import Map "mo:core/Map";

mixin (
  admins : Map.Map<Text, AdminTypes.Admin>,
  adminSessions : Map.Map<Text, Text>,
) {
  public func adminLogin(email : Text, password : Text) : async { #ok : Text; #err : Text } {
    AuthLib.adminLogin(admins, adminSessions, email, password)
  };

  public func adminLogout(token : Text) : async Bool {
    AuthLib.adminLogout(adminSessions, token)
  };

  public func validateAdminSession(token : Text) : async Bool {
    AuthLib.validateAdminSession(adminSessions, token)
  };

  public func createAdmin(email : Text, password : Text) : async { #ok; #err : Text } {
    AuthLib.ensureDefaultAdmin(admins);
    AuthLib.createAdmin(admins, email, password)
  };
};
