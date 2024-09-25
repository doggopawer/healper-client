import { ToastContext, ToastContextType } from "context/ToastContext";
import { useContext, useEffect } from "react";
import styled from "styled-components";
import CircleBox from "components/box/CircleBox/CircleBox";
import { ReactComponent as CheckIcon } from "assets/image/check.svg";

const Container = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 50%;
    width: 80%;
    height: 50px;
    background-color: ${({ theme }) => theme.color.background.box};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 40px;
    box-sizing: border-box;
    transition: all 0.5s ease-in-out;
    transform: ${({ isOpen }) =>
        isOpen ? "translate(-50%, 25%)" : "translate(-50%, -100%)"};
    opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
`;

const Text = styled.div`
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const Toast = () => {
    // 프로바이더로 가져오기
    const { isOpen, setIsOpen } = useContext(ToastContext) as ToastContextType;
    const { message } = useContext(ToastContext) as ToastContextType;

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setIsOpen(false);
            }, 3000);
        }
    }, [isOpen, setIsOpen]);

    return (
        <>
            <Container isOpen={isOpen}>
                <CircleBox width={32} height={32}>
                    <CheckIcon />
                </CircleBox>
                <Text>{message}</Text>
            </Container>
        </>
    );
};
export default Toast;