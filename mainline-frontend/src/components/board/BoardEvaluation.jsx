function getEvaluationValueText(evaluationValue) {
    let prefix;
    if (evaluationValue > 0) {
        prefix = "+";
    } else if (evaluationValue < 0) {
        prefix = "-";
    } else {
        prefix = "+-"
    }
    let displayNumber = Math.abs(evaluationValue).toString();
    if (evaluationValue == 0) {
        displayNumber = '0.0';
    }
    return [prefix + displayNumber, evaluationValue >= 0];
}

function getEvaluationValueTextDiv(evaluationValue) {
    let evaluationTextAndCompare = getEvaluationValueText(evaluationValue);
    let evaluationText = evaluationTextAndCompare[0];
    let evaluationCompare = evaluationTextAndCompare[1];
    if (evaluationCompare) {
        return <div className="evaluation-bar-left-text">{evaluationText}</div>
    }
    return <div className="evaluation-bar-right-text">{evaluationText}</div>
}

function getEvaluationPercentage(evaluationValue) {
    let percentage = 50 + (evaluationValue * 25);
    if (percentage < 0) {
        percentage = 0;
    } else if (percentage > 100) {
        percentage = 100;
    }
    return percentage.toString() + "%"
}

export function BoardEvaluation(props) {
    let evaluationValue = props.evaluation;
    return <div className="evaluation-bar">
        {getEvaluationValueTextDiv(evaluationValue)}
        <div className="evaluation-bar-left-fill" style={{width: getEvaluationPercentage(evaluationValue)}} />
        
    </div>
}