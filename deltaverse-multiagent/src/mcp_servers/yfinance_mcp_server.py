import sys
import json

def handle_request(request):
    request_id = request.get("id")
    response = {"jsonrpc": "2.0", "id": request_id}
    response["result"] = {"ticker": "DEBUG", "price": 999.99} # Static mock response
    return response

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            request = json.loads(line)
            response = handle_request(request)
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stderr.write(f"Server error: {e}\n")
            sys.stderr.flush()
