import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import java.io.FileInputStream;
import java.util.*;

/**
 * Show, grant or remove a role (the Firebase custom claim "roles") on a user.
 * The gateway turns it into Spring roles (SecurityConfig): ADMIN opens
 * /<service>/admin/**, /user-claims and the actuator.
 *
 * This is how the first admin is made: only the Admin SDK can set claims, and
 * the API's own grant endpoint already needs an admin. Run it through
 * scripts/grant-role.sh, which supplies the gateway's classpath and the
 * service account from secrets/.
 *
 *   scripts/grant-role.sh --list                     users holding any role
 *   scripts/grant-role.sh user@example.com           that user's roles
 *   scripts/grant-role.sh user@example.com ADMIN     add a role
 *   scripts/grant-role.sh user@example.com --revoke ADMIN
 *                                                    remove it and sign the user
 *                                                    out everywhere, so it applies now
 *
 * A granted role reaches the user's next ID token: sign out and in again, or
 * wait for the hourly refresh.
 */
public class GrantRole {

    private static final Set<String> ROLES = Set.of("ADMIN", "USER", "TEST"); // gateway's Role enum

    public static void main(String[] args) throws Exception {
        String serviceAccount = args[0];
        List<String> rest = List.of(args).subList(1, args.length);
        if (rest.isEmpty()) usage();

        try (FileInputStream in = new FileInputStream(serviceAccount)) {
            FirebaseApp.initializeApp(FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(in))
                    .build());
        }
        FirebaseAuth auth = FirebaseAuth.getInstance();

        if (rest.get(0).equals("--list")) {
            int n = 0;
            for (ExportedUserRecord u : auth.listUsers(null).iterateAll()) {
                List<String> roles = roles(u);
                if (!roles.isEmpty()) {
                    System.out.println(u.getEmail() + "  " + roles);
                    n++;
                }
            }
            System.out.println(n + " user(s) with roles");
            return;
        }

        UserRecord user = auth.getUserByEmail(rest.get(0));
        List<String> roles = new ArrayList<>(roles(user));

        if (rest.size() == 1) {
            System.out.println(user.getEmail() + "  " + roles);
            return;
        }

        boolean revoke = rest.get(1).equals("--revoke");
        if (rest.size() != (revoke ? 3 : 2)) usage();
        String role = rest.get(rest.size() - 1).toUpperCase(Locale.ROOT);
        if (!ROLES.contains(role)) {
            throw new IllegalArgumentException("Unknown role " + role + "; one of " + ROLES);
        }

        if (revoke) roles.remove(role);
        else if (!roles.contains(role)) roles.add(role);

        // Keep any other claims the user has; only "roles" changes.
        Map<String, Object> claims = new HashMap<>(user.getCustomClaims());
        claims.put("roles", roles);
        auth.setCustomUserClaims(user.getUid(), claims);

        if (revoke) {
            // Admin routes check for revoked sessions (FirebaseAuthenticationFilter),
            // so this takes effect at once rather than when the token expires.
            auth.revokeRefreshTokens(user.getUid());
            System.out.println(user.getEmail() + "  " + roles + "  (signed out everywhere)");
        } else {
            System.out.println(user.getEmail() + "  " + roles
                    + "  (applies from the user's next sign-in or token refresh)");
        }
    }

    @SuppressWarnings("unchecked")
    private static List<String> roles(UserRecord user) {
        Object roles = user.getCustomClaims().get("roles");
        return roles instanceof List<?> list ? (List<String>) list : List.of();
    }

    private static void usage() {
        System.err.println("usage: grant-role.sh --list | <email> [[--revoke] ROLE]");
        System.exit(2);
    }
}
