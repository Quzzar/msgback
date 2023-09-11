import { Button, Center, Modal, Stack, Text, TextInput, createStyles, rem } from "@mantine/core";
import { Conversation } from ".";
import { IconTrash } from "@tabler/icons-react";
import { setConversations, getConversations } from "./atoms/msgAtoms";

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function ConvoEditModal(props: {
  opened: boolean;
  close: () => void;
  convo?: Conversation;
}) {

  const { classes } = useStyles();

  return (
    <Modal
      opened={props.opened && !!props.convo}
      onClose={props.close}
      title={<Text fz='lg' fw={500}>Conversation Settings</Text>}
    >
        <Stack>
          <TextInput
            label="Name"
            classNames={classes}
            defaultValue={props.convo!.name}
            onChange={(e) => {
              const newConvo = props.convo!;
              newConvo.name = e.currentTarget.value;
              const convos = getConversations();
              const index = convos.findIndex((c) => c.id === newConvo.id);
              convos[index] = newConvo;
              setConversations(convos);
            }}
          />
          <Center>
          <Button
            leftIcon={<IconTrash size="1.0rem" />}
            variant="outline"
            color="red"
            onClick={() => {
              setConversations(getConversations().filter((c) => c.id !== props.convo!.id));
              window.location.reload();
            }}
          >
            Delete
          </Button>
          </Center>
        </Stack>
    </Modal>
  );
}
