import styled from "styled-components";

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 투명한 검은색 배경 */
    z-index: ${({ theme }) => theme.zIndex.backdrop};
`;

type BackdropProps = {
    isOpen: boolean;
    onBackdropClick: () => void;
};

const Backdrop = ({ isOpen, onBackdropClick }: BackdropProps) => {
    return <>{isOpen && <Container onClick={onBackdropClick} />}</>;
};

export default Backdrop;
