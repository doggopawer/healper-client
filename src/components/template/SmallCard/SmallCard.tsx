import React from "react";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;
const ImageBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 40px;
    height: 40px;
    background-color: #f0fff0;
`;
const ColumnBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;
const BoldText = styled.div`
    font-size: 13px;
    font-weight: 600;
`;
const NormalText = styled.div`
    font-size: 13px;
    font-weight: 400;
    color: ${(props) => props.theme.color.text.sub.normal};
`;

type SmallCardProps = {
    children: React.ReactNode;
};
const SmallCard = ({ children }: SmallCardProps) => {
    return <Container>{children}</Container>;
};

export default SmallCard;

SmallCard.Container = Container;
SmallCard.ImageBox = ImageBox;
SmallCard.ColumnBox = ColumnBox;
SmallCard.BoldText = BoldText;
SmallCard.NormalText = NormalText;