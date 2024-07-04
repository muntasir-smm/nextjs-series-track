// app/ui/tvSeries/progress-bar.tsx

'use client';

import React from 'react';
import styled from 'styled-components';

type ProgressBarProps = {
  width: string;
  children: React.ReactNode;
};

const BarContainer = styled.div`
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ width: string }>`
  height: 100%;
  background-color: #007bff;
  width: ${(props) => props.width || '0%'};
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const BarText = styled.span`
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 20px;
  color: white;
  font-weight: bold;
`;

const ProgressBar: React.FC<ProgressBarProps> = ({ width, children }) => (
  <BarContainer>
    <BarFill width={width}>
      <BarText>{children}</BarText>
    </BarFill>
  </BarContainer>
);

export default ProgressBar;
