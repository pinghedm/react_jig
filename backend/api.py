from dotenv import dotenv_values
import bottle
from bottle import route, run, request  # type: ignore[import]
from bottle_cors_plugin import cors_plugin

from jig import jig

CONFIG = dotenv_values(".env")

app = bottle.app()


@route("/jig", method=["POST", "OPTIONS"])
def run_jig():
    width = request.json["width"]
    height = request.json["height"]
    pieces = request.json["pieces"]

    result = jig(width, height, pieces, opinion=True)
    print(result)
    return result


app.install(cors_plugin(["http://localhost:3000"]))
additional_options = {}
if not CONFIG.get("DEBUG"):
    additional_options["server"] = "gunicorn"
    additional_options["workers"] = 1
app.run(
    host="localhost",
    port=CONFIG["PORT"],
    debug=CONFIG.get("DEBUG", False),
    **additional_options
)
