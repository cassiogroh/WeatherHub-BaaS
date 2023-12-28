import styled from "styled-components";

const linkSpacing = "30px";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${linkSpacing};

  margin: 70px auto 30px;
  padding: 6px ${linkSpacing};
  border-radius: 8px;
  background: var(--primary-color);
  width: fit-content;
`;
