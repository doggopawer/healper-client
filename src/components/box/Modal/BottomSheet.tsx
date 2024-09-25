import React from "react";
import styled from "styled-components";

const Container = styled.div<{ isOpen: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 0;

    background: ${({ theme }) => theme.color.background.box};
    padding: 25px;
    box-sizing: border-box;
    border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: 300;
    width: 100%;
    transition: all 0.5s ease-in-out;
    transform: translateY(${({ isOpen }) => (isOpen ? "0" : "100%")});
`;

type BottomSheetProps = {
    children: React.ReactNode;
    isOpen: boolean;
};

const BottomSheet = ({ children, isOpen }: BottomSheetProps) => {
    return <Container isOpen={isOpen}>{children}</Container>;
};

export default BottomSheet;