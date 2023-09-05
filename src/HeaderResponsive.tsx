import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Paper,
  Transition,
  rem,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { randomId, useDisclosure } from "@mantine/hooks";
import Logo from "./Logo";
import {
  activeConvoState,
  getConversations,
  setActiveConversation,
  setConversations,
} from "./atoms/msgAtoms";
import { IconUserPlus } from "@tabler/icons-react";
import { Conversation } from ".";
import { useRecoilState } from "recoil";

export const HEADER_HEIGHT = rem(60);
export const MAX_CONVERSATIONS = 5;

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
  },

  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.md,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

export function HeaderResponsive() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [active, setActive] = useRecoilState(activeConvoState);

  const { classes, cx } = useStyles();

  const items = getConversations().map((convo) => (
    <a
      key={convo.id}
      href={"/" + convo.id}
      className={cx(classes.link, {
        [classes.linkActive]: active === convo.id,
      })}
      onClick={(event) => {
        event.preventDefault();
        setActive(convo.id);
        setActiveConversation(convo.id);
        close();
      }}
    >
      {convo.name}
    </a>
  ));

  return (
    <Header height={HEADER_HEIGHT} className={classes.root}>
      <Container className={classes.header}>
        <Logo size={28} />

        <Group>
        <Group spacing={5} noWrap className={classes.links}>
          {items}
        </Group>

<Group spacing={7}>
        <Box p={5}>
          <Tooltip label="Create New Convo" withArrow>
            <ActionIcon
              color="dark"
              radius="xl"
              variant="subtle"
              disabled={getConversations().length >= MAX_CONVERSATIONS}
              onClick={() => {
                const newConvo = {
                  id: randomId(),
                  name: "New Convo",
                } satisfies Conversation;
                setConversations([...getConversations(), newConvo]);
                setActiveConversation(newConvo.id);
                setActive(newConvo.id);
              }}
            >
              <IconUserPlus size="1.225rem" />
            </ActionIcon>
          </Tooltip>
        </Box>

        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
        />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
        </Group>
        </Group>
      </Container>
    </Header>
  );
}
