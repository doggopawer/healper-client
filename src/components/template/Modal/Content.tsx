import React from "react";
import styled from "styled-components";

type ContentProps = {
    children: React.ReactNode;
    isOpen: boolean;
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    width: 100%;
`;

const Content = ({ children, isOpen }: ContentProps) => {
    return <>{isOpen && <Container>{children}</Container>}</>;
};

export default Content;

/*
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background: ${({ theme }) => theme.color.background.box};
    padding: 25px;
    box-sizing: border-box;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    height: 300px;
    width: 80%;
*/
