import { motion } from "framer-motion";
import { useContext } from "react";

import styled from "styled-components";
import {
    AccordionContext,
    AccordionContextType,
} from "context/AccordionContext";

const Container = styled(motion.div)`
    width: 100%;
    height: auto;
    padding: 10px;
    box-sizing: border-box;
    cursor: grab;
    box-shadow: ${(props) => props.theme.boxShadow};
    border-radius: ${(props) => props.theme.borderRadius};
`;

type MotionProps = {
    children: React.ReactNode;
};

const Motion = ({ children }: MotionProps) => {
    const { handleDragEnd, x } = useContext(
        AccordionContext
    ) as AccordionContextType;
    return (
        <Container
            drag="x"
            dragConstraints={{ left: -65, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{ x }}
        >
            {children}
        </Container>
    );
};

export default Motion;
