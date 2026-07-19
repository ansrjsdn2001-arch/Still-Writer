import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Supabase PostgreSQL 마이그레이션 실행용 로컬 도구입니다.
 *
 * <p>주의:
 * - 이 파일은 비밀번호를 직접 저장하지 않습니다.
 * - backend/.env 파일에서 DB 접속 정보를 읽습니다.
 * - 실행 로그에는 비밀번호와 전체 JDBC URL을 출력하지 않습니다.
 */
public class RunSupabaseMigration {

    private static final Path ENV_PATH = Path.of("backend", ".env");
    private static final Path DEFAULT_MIGRATION_PATH = Path.of("backend", "database", "migrations", "V001__initial_schema.sql");
    private static final int DEFAULT_EXPECTED_TABLE_COUNT = 17;

    public static void main(String[] args) throws Exception {
        Path migrationPath = args.length >= 1 ? Path.of(args[0]) : DEFAULT_MIGRATION_PATH;
        int expectedTableCount = args.length >= 2 ? Integer.parseInt(args[1]) : DEFAULT_EXPECTED_TABLE_COUNT;

        Map<String, String> env = readEnv(ENV_PATH);

        String host = require(env, "DB_HOST");
        String port = env.getOrDefault("DB_PORT", "5432");
        String database = env.getOrDefault("DB_NAME", "postgres");
        String username = require(env, "DB_USERNAME");
        String password = require(env, "DB_PASSWORD");
        String sslMode = env.getOrDefault("DB_SSL_MODE", "require");

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?sslmode=" + sslMode;
        String sql = Files.readString(migrationPath, StandardCharsets.UTF_8);
        List<String> statements = splitSqlStatements(sql);

        System.out.println("Supabase PostgreSQL 마이그레이션을 시작합니다.");
        System.out.println("대상 Host: " + host);
        System.out.println("대상 DB: " + database);
        System.out.println("마이그레이션 파일: " + migrationPath);
        System.out.println("실행할 SQL 문 수: " + statements.size());

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {

            for (int i = 0; i < statements.size(); i++) {
                String query = statements.get(i).trim();
                if (query.isEmpty()) {
                    continue;
                }

                try {
                    statement.execute(query);
                } catch (SQLException e) {
                    System.err.println("SQL 실행 실패: " + (i + 1) + "번째 문장");
                    System.err.println("오류 코드: " + e.getSQLState());
                    System.err.println("오류 메시지: " + e.getMessage());
                    throw e;
                }
            }

            verifyTables(statement, expectedTableCount);
        }

        System.out.println("마이그레이션 실행이 완료되었습니다.");
    }

    private static Map<String, String> readEnv(Path path) throws IOException {
        Map<String, String> values = new LinkedHashMap<>();

        for (String line : Files.readAllLines(path, StandardCharsets.UTF_8)) {
            String trimmed = line.trim();

            // 빈 줄과 주석은 설정값이 아니므로 건너뜁니다.
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                continue;
            }

            int equalsIndex = trimmed.indexOf('=');
            if (equalsIndex <= 0) {
                continue;
            }

            String key = trimmed.substring(0, equalsIndex).trim();
            String value = trimmed.substring(equalsIndex + 1).trim();
            values.put(key, value);
        }

        return values;
    }

    private static String require(Map<String, String> values, String key) {
        String value = values.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("backend/.env에 필수 설정이 없습니다: " + key);
        }
        return value;
    }

    private static List<String> splitSqlStatements(String sql) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inSingleQuote = false;
        boolean inLineComment = false;

        for (int i = 0; i < sql.length(); i++) {
            char currentChar = sql.charAt(i);
            char nextChar = i + 1 < sql.length() ? sql.charAt(i + 1) : '\0';

            if (inLineComment) {
                current.append(currentChar);
                if (currentChar == '\n') {
                    inLineComment = false;
                }
                continue;
            }

            if (!inSingleQuote && currentChar == '-' && nextChar == '-') {
                current.append(currentChar);
                current.append(nextChar);
                inLineComment = true;
                i++;
                continue;
            }

            if (currentChar == '\'') {
                current.append(currentChar);

                // PostgreSQL 문자열 안에서 작은따옴표 두 개('')는 이스케이프 문자입니다.
                if (inSingleQuote && nextChar == '\'') {
                    current.append(nextChar);
                    i++;
                    continue;
                }

                inSingleQuote = !inSingleQuote;
                continue;
            }

            if (!inSingleQuote && currentChar == ';') {
                statements.add(current.toString());
                current.setLength(0);
                continue;
            }

            current.append(currentChar);
        }

        if (!current.toString().trim().isEmpty()) {
            statements.add(current.toString());
        }

        return statements;
    }

    private static void verifyTables(Statement statement, int expectedTableCount) throws SQLException {
        String sql = """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_type = 'BASE TABLE'
                ORDER BY table_name
                """;

        List<String> tables = new ArrayList<>();
        try (ResultSet rs = statement.executeQuery(sql)) {
            while (rs.next()) {
                tables.add(rs.getString("table_name"));
            }
        }

        System.out.println("생성된 public 테이블 수: " + tables.size());
        System.out.println("생성된 테이블: " + String.join(", ", tables));

        if (tables.size() != expectedTableCount) {
            throw new IllegalStateException(
                    "예상 테이블 수는 " + expectedTableCount + "개인데 실제 테이블 수는 " + tables.size() + "개입니다."
            );
        }
    }
}
