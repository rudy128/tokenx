-- Diagnostic SQL Queries to Check User/Session Sync Issues
-- Run these in Prisma Studio or your database client

-- 1. Check total users
SELECT COUNT(*) as total_users FROM "User";

-- 2. Check total sessions
SELECT COUNT(*) as total_sessions FROM "Session";

-- 3. Check for orphaned sessions (sessions without corresponding users)
SELECT 
    s.id as session_id,
    s."userId" as user_id_in_session,
    s.expires,
    CASE 
        WHEN u.id IS NULL THEN '❌ USER NOT FOUND'
        ELSE '✅ USER EXISTS'
    END as user_status
FROM "Session" s
LEFT JOIN "User" u ON s."userId" = u.id
ORDER BY s.expires DESC
LIMIT 10;

-- 4. Check users with their authentication methods
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    COUNT(DISTINCT a.provider) as auth_providers,
    STRING_AGG(DISTINCT a.provider, ', ') as providers
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
GROUP BY u.id, u.email, u.name, u.role
ORDER BY u."createdAt" DESC
LIMIT 10;

-- 5. Check for users without any authentication method
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    CASE 
        WHEN u.password IS NOT NULL THEN '✅ Has Password'
        ELSE '❌ No Password'
    END as password_status,
    CASE 
        WHEN a.id IS NOT NULL THEN '✅ Has OAuth'
        ELSE '❌ No OAuth'
    END as oauth_status
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE u.password IS NULL AND a.id IS NULL;

-- 6. Check campaigns count
SELECT 
    status,
    COUNT(*) as count
FROM "Campaign"
GROUP BY status;

-- 7. Check recent sessions with user details
SELECT 
    s.id as session_id,
    s."userId",
    u.email,
    u.name,
    u.role,
    s.expires,
    CASE 
        WHEN s.expires > NOW() THEN '✅ VALID'
        ELSE '❌ EXPIRED'
    END as session_status
FROM "Session" s
LEFT JOIN "User" u ON s."userId" = u.id
ORDER BY s.expires DESC
LIMIT 5;
