import catalanBoardIcon from '../images/catalan.png';

export const studyIconColor = "#00AC8D";
export const trainerIconColor = "#23B5EF";
export const iconSecondaryColor = "#1E1E1E";

const boardIconMappings = {
    "catalan": catalanBoardIcon,
}
export function getBoardIcon(opening_name) {
    return boardIconMappings[opening_name];
}