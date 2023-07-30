import styled from 'styled-components';

export const Container = styled.div`
  margin-bottom: 20px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0;

  width: 100%;

  form {
    width: 340px;
    text-align: center;
    display: flex;
    flex-direction: column;

    input[name='old_password'] {

    }
  }

  p {
    margin-top: 50px;
  }
`;
