import { useTransition } from "react-spring";

import Toast from "./Toast";
import { ToastMessage } from "../../hooks/toast";
import { Container } from "./styles";

interface ToastCointainer {
  messages: ToastMessage[];
}

const ToastCointainer = ({ messages }: ToastCointainer) => {

  const messagesWithTransitions = useTransition(
    messages,
    message => message.id,
    {
      from: { right: "-120%", opacity: 0 },
      enter: { right: "0%", opacity: 1 },
      leave: { right: "-120%", opacity: 0 },
    },
  );

  return (
    <Container>
      {messagesWithTransitions.map(({ item, key, props }) => (
        <Toast
          key={key}
          style={props}
          message={item}
          timeout={item.timeout || 6000}
        />
      ))}
    </Container>
  );
};

export default ToastCointainer;
