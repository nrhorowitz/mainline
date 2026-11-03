import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import Switch from '@mui/material/Switch';
import { BoardControlOption } from '../../util/board';

const label = { inputProps: { 'aria-label': 'Size switch demo' } };

export function BoardControl(props) {
    let leftArrowDisabled = false;
    let leftDoubleArrowDisabled = false;
    let rightArrowDisabled = false;
    let rightDoubleArrowDisabled = false;
    if (props.boardIndex === 0) {
        leftArrowDisabled = true;
        leftDoubleArrowDisabled = true;
    }
    if (props.boardIndex === props.boardLength - 1) {
        rightArrowDisabled = true;
        rightDoubleArrowDisabled = true;
    }
    const toggleText = (props.showSolutionBoard) ? "Solution" : "Practice";
    return <div className="board-control">
        <div className="board-control-arrows">
            <IconButton onClick={() => props.boardControlOptionCallback(BoardControlOption.LEFT_DOUBLE)} disabled={leftDoubleArrowDisabled}>
                <KeyboardDoubleArrowLeftIcon color="primary" sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton onClick={() => props.boardControlOptionCallback(BoardControlOption.LEFT)} disabled={leftArrowDisabled}>
                <KeyboardArrowLeftIcon color="primary" sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton onClick={() => props.boardControlOptionCallback(BoardControlOption.RIGHT)} disabled={rightArrowDisabled}>
                <KeyboardArrowRightIcon color="primary" sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton onClick={() => props.boardControlOptionCallback(BoardControlOption.RIGHT_DOUBLE)} disabled={rightDoubleArrowDisabled}>
                <KeyboardDoubleArrowRightIcon color="primary" sx={{ fontSize: 40 }} />
            </IconButton>
        </div>
        <IconButton onClick={() => props.boardControlOptionCallback(BoardControlOption.RESET)}>
            <RefreshIcon color="primary" sx={{ fontSize: 40 }} />
        </IconButton>
    </div>;
}