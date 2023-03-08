def hasBetterRatio(ratio, gridRatio, currentBest):
    return abs(currentBest / ratio - 1) < abs(gridRatio / ratio - 1)


def lowFactors(n):
    # all the factors which are the lower half of each factor pair
    return [j for j in range(1, int(n**0.5) + 1) if n % j == 0]


def bestSolution(ratio, value):
    currentBest = 0
    idealSides = []
    for factor in lowFactors(value):
        wholeNumRatio = int(value / factor)  # must be a whole number anyway
        currentRatio = wholeNumRatio / factor
        if currentBest == 0:
            currentBest = currentRatio
            idealSides = [factor, wholeNumRatio]
        else:
            if abs(currentRatio / ratio - 1) < abs(currentBest / ratio - 1):
                currentBest = currentRatio
                idealSides = [factor, wholeNumRatio]
    return currentBest, idealSides


def getBestSolutionForRange(debugMode, numPieces, penalty, ratio, valueRange, opinion):
    gridRatio = 0
    idealNSides = []
    bestNumPieces = 0
    best = 100
    bestDeets = []

    output = {"goodSizes": [], "bestSizeMessage": ""}

    for value in valueRange:
        currentBest, idealSides = bestSolution(ratio, value)

        if bestNumPieces == 0 or (hasBetterRatio(ratio, gridRatio, currentBest)):
            bestNumPieces = value
            gridRatio = currentBest
            idealNSides = idealSides
            pieceRatio = calcRatio(ratio, currentBest)
            badnessScore = (penalty ** (abs(value - numPieces))) * pieceRatio

            if badnessScore < best:
                best = badnessScore
                bestDeets = [bestNumPieces, idealNSides, gridRatio]
            output_dict = {
                "pieces": bestNumPieces,
                "sides": idealNSides,
                "gridRatio": round(gridRatio, 2),
                "pieceRatio": round(pieceRatio, 2),
                "message": f"{bestNumPieces} pieces in {idealNSides} (grid ratio {round(gridRatio, 4)}) needs piece ratio "
                f"{round(pieceRatio, 4)}",
            }
            if debugMode is True:
                output_dict["badness"] = round(badnessScore, 5)
            output["goodSizes"].append(output_dict)

    if opinion is True:
        best_size_message = f"For {numPieces} the best is {bestNumPieces} pieces with size {idealNSides}"
        output["bestSizeMessage"] = best_size_message

    return best, bestDeets, output


def calcRatio(numA, numB):
    return max(numA, numB) / min(numA, numB)


def jig(width, height, numPieces, opinion=False, debugMode=False):
    # percentage we'll check in either direction
    threshold = 0.1

    penalty = 1.005

    maxCap = int((1 + threshold) * numPieces)
    minCap = int((1 - threshold) * numPieces)

    ratio = calcRatio(width, height)

    output_info = {
        "baseDetails": f"{width} by {height} is picture ratio {round(ratio, 4)}",
        "baseNumPieces": numPieces,
    }

    upRange = list(range(numPieces, maxCap + 1))
    upBest, upBestDeets, up_output = getBestSolutionForRange(
        debugMode, numPieces, penalty, ratio, upRange, opinion
    )

    downRange = list(range(minCap, numPieces))  # do not want n included again
    downRange.reverse()

    downBest, downBestDeets, down_output = getBestSolutionForRange(
        debugMode, numPieces, penalty, ratio, downRange, opinion
    )

    output_info["up"] = up_output
    output_info["down"] = down_output
    output_info[
        "opinionBest"
    ] = f"If I had to guess: I think it's {upBestDeets[0]} pieces."
    output_info["opinionBetter"] = (
        f"BUT, fun fact, {downBestDeets[0]} would be even better."
        if downBest < upBest
        else ""
    )

    return output_info


if __name__ == "__main__":
    output_info = jig(20, 18, 1000, opinion=True)

    print(output_info["baseDetails"])
    print("Looking for >= 1000 solutions:")
    for details in output_info["up"]["goodSizes"]:
        print(details["message"])
    print(output_info["up"]["bestSizeMessage"])

    print("\nOut of interest, here are smaller options:")
    for details in output_info["down"]["goodSizes"]:
        print(details["message"])

    print(output_info["opinionBest"])
    print(output_info["opinionBetter"])
