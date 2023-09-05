
import { Code, Flex, Image, createStyles, Text } from "@mantine/core";
import LogoImg from "../public/icon.png";
import { version } from "../package.json";

const useStyles = createStyles((theme) => ({
  version: {
    backgroundColor: theme.fn.lighten(
      theme.fn.variant({ variant: "filled", color: "dark" }).background!,
      0.25
    ),
    color: theme.white,
    fontWeight: 700,
    fontSize: 6,
    marginLeft: 2,
  },
}));

export default function Logo(props: { size?: number }) {
  const { classes } = useStyles();

  return (
    <Flex h={40} justify="center">
      <Flex
        gap={5}
        justify="center"
        align="center"
        wrap="nowrap"
        className="cursor-pointer"
        sx={{ userSelect: "none" }}
        onClick={() => {
          window.location.href = "/";
        }}
      >

        <Image
          height={props.size || 18}
          width={props.size || 18}
          fit="contain"
          src={LogoImg}
          alt="MsgBack"
        />
        <Text fw={400} fz={16}>MsgBack</Text>

          <Code className={classes.version}>v{version}</Code>
      </Flex>
    </Flex>
  );
}
