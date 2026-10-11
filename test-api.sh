#!/bin/bash
# Runs a full check of the API. Start the API first, then run:  bash test-api.sh
H="http://localhost:5237"; J="Content-Type: application/json"
check() { [ "$2" = "$3" ] && echo "PASS  $1" || echo "FAIL  $1 (expected $2, got $3)"; }
code()  { curl -s -o /dev/null -w "%{http_code}" "$@"; }
tok()   { curl -s -X POST $H/api/users/login -H "$J" -d "{\"username\":\"$1\",\"password\":\"$2\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/'; }
idof()  { sed -E "s/.*\"$1\":([0-9]+).*/\1/"; }

echo "--- Auth ---"
check "no token -> 401"       401 $(code $H/api/tickets)
check "wrong password -> 401" 401 $(code -X POST $H/api/users/login -H "$J" -d '{"username":"admin","password":"wrong"}')

TOKEN=$(tok admin admin123); USER_TOKEN=$(tok john user123)
[[ $TOKEN == eyJ* ]]      || { echo "FAIL  admin login did not return a token. Server said:"; echo "$TOKEN" | head -n 3; exit 1; }
[[ $USER_TOKEN == eyJ* ]] || { echo "FAIL  john login did not return a token. Server said:"; echo "$USER_TOKEN" | head -n 3; exit 1; }
echo "PASS  admin and john both got tokens"
A="Authorization: Bearer $TOKEN"; U="Authorization: Bearer $USER_TOKEN"

echo "--- Tickets ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST $H/api/tickets -H "$A" -H "$J" -d '{"title":"Test ticket","description":"Created by test script","priority":"High"}')
check "create ticket -> 201" 201 "$(echo "$RESP" | tail -n1)"
NEW=$(echo "$RESP" | head -n1 | idof ticket_id)
echo "      new ticket id: $NEW"
check "list tickets -> 200"      200 $(code $H/api/tickets -H "$A")
check "my tickets -> 200"        200 $(code $H/api/tickets/mine -H "$A")
check "get ticket -> 200"        200 $(code $H/api/tickets/$NEW -H "$A")
check "missing ticket -> 404"    404 $(code $H/api/tickets/999999 -H "$A")
check "invalid ticket -> 400"    400 $(code -X POST $H/api/tickets -H "$A" -H "$J" -d '{"title":"","description":"x","priority":"Urgent"}')
check "update ticket -> 204"     204 $(code -X PUT $H/api/tickets/$NEW -H "$A" -H "$J" -d '{"title":"Test ticket","description":"Updated","status":"In Progress","priority":"Low"}')
check "user updates ticket -> 403"  403 $(code -X PUT $H/api/tickets/$NEW -H "$U" -H "$J" -d '{"title":"x","description":"x","status":"Done","priority":"Low"}')

echo "--- Comments ---"
CRESP=$(curl -s -w "\n%{http_code}" -X POST $H/api/tickets/$NEW/comments -H "$A" -H "$J" -d '{"title":"Hi","description":"Test comment"}')
check "add comment -> 201" 201 "$(echo "$CRESP" | tail -n1)"
CID=$(echo "$CRESP" | head -n1 | idof comment_id)
echo "      new comment id: $CID"
check "list comments -> 200"             200 $(code $H/api/tickets/$NEW/comments -H "$A")
check "get comment -> 200"               200 $(code $H/api/tickets/$NEW/comments/$CID -H "$A")
check "comment under wrong ticket -> 404" 404 $(code $H/api/tickets/999999/comments/$CID -H "$A")
check "edit comment -> 204"              204 $(code -X PUT $H/api/tickets/$NEW/comments/$CID -H "$A" -H "$J" -d '{"title":"Edited","description":"Edited text"}')
check "comment on missing ticket -> 400" 400 $(code -X POST $H/api/tickets/999999/comments -H "$A" -H "$J" -d '{"title":"Hi","description":"x"}')
check "delete comment -> 204"            204 $(code -X DELETE $H/api/tickets/$NEW/comments/$CID -H "$A")

echo "--- Roles ---"
check "user lists users -> 403"     403 $(code $H/api/users -H "$U")
check "admin lists users -> 200"    200 $(code $H/api/users -H "$A")
check "user deletes ticket -> 403"  403 $(code -X DELETE $H/api/tickets/$NEW -H "$U")
check "admin deletes ticket -> 204" 204 $(code -X DELETE $H/api/tickets/$NEW -H "$A")

echo "--- Register / users ---"
NAME="test$RANDOM"
RRESP=$(curl -s -w "\n%{http_code}" -X POST $H/api/users/register -H "$J" -d "{\"username\":\"$NAME\",\"password\":\"abcd1234\"}")
check "register -> 201" 201 "$(echo "$RRESP" | tail -n1)"
UID_NEW=$(echo "$RRESP" | head -n1 | idof user_id)
check "register again -> 409"       409 $(code -X POST $H/api/users/register -H "$J" -d "{\"username\":\"$NAME\",\"password\":\"abcd1234\"}")
check "new user can log in"         "eyJ" "$(tok $NAME abcd1234 | cut -c1-3)"
check "user edits a user -> 403"    403 $(code -X PUT $H/api/users/$UID_NEW -H "$U" -H "$J" -d "{\"username\":\"$NAME\",\"role\":\"User\"}")
check "admin edits a user -> 204"   204 $(code -X PUT $H/api/users/$UID_NEW -H "$A" -H "$J" -d "{\"username\":\"$NAME\",\"role\":\"User\"}")
