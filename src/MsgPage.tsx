import { useRecoilValue } from "recoil";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import {
  IconAnalyze,
  IconCopy,
  IconDots,
  IconMessageCirclePlus,
  IconMicrophone,
  IconPencil,
  IconShare3,
  IconTrash,
  IconWriting,
} from "@tabler/icons-react";
import {
  activeConvoState,
  deleteMessage,
  getConversations,
  getInputSource,
  getMessages,
  setConversations,
  setInputSource,
  setMessages,
} from "./atoms/msgAtoms";
import { randomId, useClipboard, useForceUpdate } from "@mantine/hooks";
import { HEADER_HEIGHT } from "./HeaderResponsive";
import { FollowUpType, Message } from ".";
import { getAICompletion, getFollowUpPrompt } from "./gen-utils";
import TranscribeAudio from "./AudioTranscriber";

export default function MsgPage() {
  const forceUpdate = useForceUpdate();
  const clipboard = useClipboard();

  const [loading, setLoading] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<string | null>('add');

  const activeConvoId = useRecoilValue(activeConvoState);
  const [editMessage, setEditMessage] = useState<Message>();

  const [newMessage, setNewMessage] = useState("");

  const [followUpType, setFollowUpType] = useState<FollowUpType>("SMOOTH");

  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [analyzeInstructions, setAnalyzeInstructions] = useState("");

  const [openedMsgAnalyze, setOpenedMsgAnalyze] = useState(false);
  const [openedMsgLoading, setOpenedMsgLoading] = useState(false);
  const [openedMsgContent, setOpenedMsgContent] = useState("");
  const openMsgAnalyze = (messageId: string) => {
    analyzeMessage(messageId);
    setOpenedMsgContent("");
    setOpenedMsgAnalyze(true);
  };

  const [openedConvoAnalyze, setOpenedConvoAnalyze] = useState(false);
  const [openedConvoLoading, setOpenedConvoLoading] = useState(false);
  const [openedConvoContent, setOpenedConvoContent] = useState("");
  const openConvoAnalyze = () => {
    analyzeConversation();
    setOpenedConvoContent("");
    setOpenedConvoAnalyze(true);
  };

  const [audioTranscriberOpened, setAudioTranscriberOpened] = useState(false);

  // const [formToken, setFormToken] = useState<string>("");
  // const [loadingAITest, setLoadingAITest] = useState(false);

  const determineConvoName = async () => {

    const convo = getConversations().find((c) => c.id === activeConvoId);
    if(!convo || convo.name !== 'New Convo') { return; }

    const msgs = getMessages(activeConvoId);
    if(msgs.length < 4) { return; }

    const convoName = await getAICompletion(`
      Please determine a short term for the person I'm talking to. It could be their name, a nickname, or something else. Please keep it short, max 20 characters.
      If there's no good term that's really fitting, just say "No term".

      Here is our conversation so far:
      ${getMessages(activeConvoId)
        .map((msg) => `${msg.source === "THEM" ? "Them" : "Me"}: ${msg.text}`)
        .join("\n")}
    `);
    if(convoName.toLowerCase().includes('no term')) { return; }
    convo.name = convoName;
    setConversations(getConversations().map((c) => c.id === activeConvoId ? convo : c));
    location.reload();

  }

  const generateFollowUp = async () => {
    setLoading(true);
    const convo = getMessages(activeConvoId);
    // .filter(
    //   (msg) => msg.source !== "YOU-REPLY"
    // );
    // If the last message has source "YOU-REPLY", remove it
    if (convo.length > 0 && convo[convo.length - 1].source === "YOU-REPLY") {
      convo.pop();
    }

    let reply = await getAICompletion(
      getFollowUpPrompt(followUpType, followUpInstructions, convo)
    );
    reply = reply
      .replace("Me: ", "")
      .replace("Them: ", "")
      .replace("Her: ", "")
      .replace(/"/g, "")
      .trim();

    setMessages(activeConvoId, [
      ...convo,
      { id: randomId(), source: "YOU-REPLY", text: reply },
    ]);
    setLoading(false);
    setTimeout(() => scrollToBottom(true), 100);
  };

  const analyzeMessage = async (messageId: string) => {
    setOpenedMsgLoading(true);

    let message: Message | null = null;
    const convo = [];
    for (const msg of getMessages(activeConvoId)) {
      if (msg.id === messageId) {
        message = msg;
        break;
      } else {
        convo.push(msg);
      }
    }
    if (!message) {
      setOpenedMsgLoading(false);
      return;
    }

    const prompt =
      message.source === "THEM"
        ? `
      I'm talking to a person on a dating app. Them just sent me a message. Please give me an analysis of it. Is it a good message? What are some things I should be concerned about with that message. This conversation should be funny, interesting, and smooth. The end goal should be to build a connection and go on a date with them. Please keep the analysis short and concise, max 200 characters. Please format it in clean, easy-to-read way. Use they/them pronouns when referring to them.
      The message they just sent: ${message.text}
    `
        : `
      I'm talking to a person on a dating app. I just sent this message to them. Please give me an analysis of it. Is it a good message? What are some things I should be concerned about with that message. This conversation should be funny, interesting, and smooth. The end goal should be to build a connection and go on a date with them. Please keep the analysis short and concise, max 200 characters. Please format it in clean, easy-to-read way. Use they/them pronouns when referring to them.
      The message I just sent: ${message.text}
    `;

    let analysis = await getAICompletion(`
      ${prompt}

      Here is our conversation so far:
      ${convo
        .map((msg) => `${msg.source === "THEM" ? "Them" : "Me"}: ${msg.text}`)
        .join("\n")}
    `);
    analysis = analysis
      .replace("Message Analysis:", "")
      .replace("Message analysis:", "")
      .replace("Analysis:", "")
      .trim();

    setOpenedMsgContent(analysis);
    setOpenedMsgLoading(false);
  };

  const analyzeConversation = async () => {
    setOpenedConvoLoading(true);

    let analysis = await getAICompletion(`
      I'm talking to a person on a dating app. Please give me an analysis of our conversation. Is it a good conversation? What are some things I should be concerned about with this conversation. This conversation should be funny, interesting, and smooth. The end goal should be to build a connection and go on a date with them. Please keep the analysis short and concise, max 200 characters. Please format it in clean, easy-to-read way. Use they/them pronouns when referring to them.
      Additional details: ${analyzeInstructions}

      Here is our conversation so far:
      ${getMessages(activeConvoId)
        .map((msg) => `${msg.source === "THEM" ? "Them" : "Me"}: ${msg.text}`)
        .join("\n")}
    `);
    analysis = analysis
      .replace("Conversation Analysis:", "")
      .replace("Conversation analysis:", "")
      .replace("Analysis:", "")
      .trim();

    setOpenedConvoContent(analysis);
    setOpenedConvoLoading(false);
  };

  const scrollToBottom = (smooth?: boolean) =>
    viewport?.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, []);

  return (
    <>
      <Flex
        w="min(100%, 400px)"
        h={`calc(100vh - ${HEADER_HEIGHT})`}
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* <Menu shadow="md" width={200} withinPortal withArrow>
          <Menu.Target>
            <ActionIcon
              sx={{
                position: "absolute",
                top: "0.0rem",
                right: "0.0rem",
                zIndex: 100,
              }}
              radius="xl"
            >
              <IconSettings size="1.2rem" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item icon={<IconPencil size={14} />}>Rename Convo</Menu.Item>

            <Menu.Divider />

            <Menu.Label>Danger zone</Menu.Label>
            <Menu.Item
              color="red"
              icon={<IconTrash size={14} />}
              onClick={() => {
                
              }}
            >
              Delete Convo
            </Menu.Item>
          </Menu.Dropdown>
        </Menu> */}

        <ScrollArea
          h={`calc(100vh - ${HEADER_HEIGHT} - 11rem)`}
          viewportRef={viewport}
        >
          <Stack m="md" spacing={2}>
            {getMessages(activeConvoId).map((msg, index) => (
              <Group
                key={index}
                position={msg.source === "THEM" ? "left" : "right"}
              >
                <Paper
                  shadow="xs"
                  p="xs"
                  mt={
                    index !== 0 &&
                    getMessages(activeConvoId)[index - 1].source !== msg.source
                      ? 15
                      : 0
                  }
                  w="80%"
                  radius="md"
                  sx={{ position: "relative" }}
                >
                  <Menu shadow="md" width={200} withinPortal withArrow>
                    <Menu.Target>
                      <ActionIcon
                        sx={{
                          position: "absolute",
                          top: "0.2rem",
                          right: "0.2rem",
                        }}
                        radius="xl"
                      >
                        <IconDots size="0.9rem" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>Options</Menu.Label>
                      <Menu.Item
                        icon={<IconAnalyze size={14} />}
                        onClick={() => {
                          openMsgAnalyze(msg.id);
                        }}
                      >
                        Analyze
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconCopy size={14} />}
                        onClick={() => clipboard.copy(msg.text)}
                      >
                        Copy
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconPencil size={14} />}
                        onClick={() => {
                          setEditMessage(msg);
                        }}
                      >
                        Edit
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Label>Danger zone</Menu.Label>
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={14} />}
                        onClick={() => {
                          deleteMessage(activeConvoId, msg.id);
                          forceUpdate();
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>

                  {(index === 0 ||
                    getMessages(activeConvoId)[index - 1].source !==
                      msg.source) && (
                    <Text fz="md" fw={500}>
                      {msg.source === "THEM"
                        ? "Them"
                        : msg.source === "YOU"
                        ? "You"
                        : "You (AI)"}
                    </Text>
                  )}
                  {editMessage?.id === msg.id ? (
                    <Box>
                      <Box
                        sx={{
                          position: "absolute",
                          top: "1.8rem",
                          right: "0.7rem",
                        }}
                      >
                        <IconPencil size={12} />
                      </Box>
                      <Textarea
                        placeholder="Message"
                        variant="unstyled"
                        autosize
                        defaultValue={editMessage.text}
                        onChange={(event) =>
                          (editMessage.text = event.currentTarget.value)
                        }
                        styles={{
                          input: {
                            padding: "0px!important",
                          },
                        }}
                        onBlur={() => {
                          const messages = getMessages(activeConvoId).map(
                            (m) => {
                              if (m.id === editMessage!.id) {
                                return editMessage!;
                              }
                              return m;
                            }
                          );
                          setMessages(activeConvoId, messages);
                          setEditMessage(undefined);
                        }}
                      />
                    </Box>
                  ) : (
                    <Text
                      fz="sm"
                      sx={{
                        whiteSpace: "pre-line",
                      }}
                    >
                      {msg.text}
                    </Text>
                  )}
                </Paper>
              </Group>
            ))}
          </Stack>
          {getMessages(activeConvoId).length === 0 && (
            <Center h="40vh">
              <Text fz="xs" fs="italic" ta="center" c="dimmed">
                Empty conversation, add some messages to get started!
              </Text>
            </Center>
          )}
        </ScrollArea>

        <Paper p="xs" radius="md" h="11rem" withBorder>
          <Tabs value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab
                value="add"
                icon={<IconMessageCirclePlus size="0.8rem" />}
              >
                Add
              </Tabs.Tab>
              <Tabs.Tab value="generate" icon={<IconWriting size="0.8rem" />}>
                Generate
              </Tabs.Tab>
              <Tabs.Tab value="analyze" icon={<IconAnalyze size="0.8rem" />}>
                Analyze
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="add" pt="xs">
              <Textarea
                placeholder="Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.currentTarget.value)}
              />
              <Group pt="sm" position="apart">
                <Group>
                  <SegmentedControl
                    size="xs"
                    value={getInputSource(activeConvoId)}
                    onChange={(value) => {
                      setInputSource(activeConvoId, value as "YOU" | "THEM");
                      forceUpdate();
                    }}
                    data={[
                      { label: "You", value: "YOU" },
                      { label: "Them", value: "THEM" },
                    ]}
                  />
                  <Button
                    onClick={() => {
                      setMessages(activeConvoId, [
                        ...getMessages(activeConvoId),
                        {
                          id: randomId(),
                          source: getInputSource(activeConvoId),
                          text: newMessage,
                        },
                      ]);
                      determineConvoName();
                      setNewMessage("");
                      setTimeout(() => scrollToBottom(true), 100);
                    }}
                    disabled={newMessage === ""}
                    radius="xl"
                    size="xs"
                  >
                    Add Message
                  </Button>
                </Group>
                <Tooltip label="Insert Convo via Audio" withArrow>
                  <ActionIcon
                    radius="xl"
                    onClick={() => {
                      setAudioTranscriberOpened(true);
                    }}
                  >
                    <IconMicrophone size="1.125rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="generate" pt="xs">
              <Textarea
                placeholder="Additional Instructions"
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.currentTarget.value)}
              />
              <Group pt="sm">
                <SegmentedControl
                  size="xs"
                  value={followUpType}
                  onChange={(value) => {
                    setFollowUpType(value as FollowUpType);
                  }}
                  data={[
                    { label: "Smooth", value: "SMOOTH" },
                    { label: "Deep", value: "DEEP" },
                    { label: "Funny", value: "FUNNY" },
                  ]}
                />
                <Button
                  radius="xl"
                  size="xs"
                  onClick={generateFollowUp}
                  loading={loading}
                  disabled={getMessages(activeConvoId).length === 0}
                >
                  Generate Follow-Up
                </Button>
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="analyze" pt="xs">
              <Textarea
                placeholder="Additional Instructions"
                value={analyzeInstructions}
                onChange={(e) => setAnalyzeInstructions(e.currentTarget.value)}
              />
              <Button
                mt="sm"
                radius="xl"
                size="xs"
                onClick={openConvoAnalyze}
                loading={loading}
                disabled={getMessages(activeConvoId).length === 0}
              >
                Analyze Conversation
              </Button>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Flex>
      <Modal
        opened={openedMsgAnalyze}
        onClose={() => setOpenedMsgAnalyze(false)}
        title="Message Analysis"
        sx={{ position: "relative" }}
      >
        <LoadingOverlay visible={openedMsgLoading} />
        <Textarea value={openedMsgContent} readOnly autosize minRows={5} />
      </Modal>
      <Modal
        opened={openedConvoAnalyze}
        onClose={() => setOpenedConvoAnalyze(false)}
        title={<Text fz="lg" fw={500}>Conversation Analysis</Text>}
        sx={{ position: "relative" }}
      >
        <LoadingOverlay visible={openedConvoLoading} />
        <Textarea value={openedConvoContent} readOnly autosize minRows={5} />
        <Center pt={5}>
        {!openedConvoLoading && (
          <Button
            variant="subtle"
            rightIcon={<IconShare3 size="0.9rem" stroke={2} />}
            size="xs"
            compact
            onClick={() => {
              setFollowUpInstructions(openedConvoContent);
              setActiveTab('generate');
              setOpenedConvoAnalyze(false);
            }}
          >
            Set as Generate Instructions
          </Button>
        )}
        </Center>
      </Modal>

      <TranscribeAudio
        active={audioTranscriberOpened}
        onClose={() => {
          setAudioTranscriberOpened(false);
        }}
        onTranscription={(messages) => {
          setMessages(activeConvoId, [
            ...getMessages(activeConvoId),
            ...messages,
          ]);
          determineConvoName();
          setTimeout(() => scrollToBottom(true), 100);
        }}
      />

      {/* <Modal
        opened={openAIToken === null}
        onClose={() => {}}
        title={
          <Text fz="xl" fw="500">
            Insert OpenAI API Token
          </Text>
        }
        sx={{ position: "relative" }}
      >
        <Text fz={12}>
          An OpenAI API token is required to use this website. Please generate
          one then insert it below. This token is ONLY stored locally. However,
          to be safe, only use the generated token for this website.
        </Text>
        <Box mt="sm">
          <Center>
            <TextInput
              size="xs"
              placeholder="OpenAI API Token"
              value={formToken}
              onChange={(e) => setFormToken(e.currentTarget.value)}
            />
            <Button
              size="xs"
              variant="outline"
              onClick={async () => {
                setLoadingAITest(true);
                const testOpenAI = new OpenAI({
                  apiKey: formToken,
                  dangerouslyAllowBrowser: true,
                });
                const completion = await testOpenAI.chat.completions.create({
                  messages: [
                    {
                      role: "user",
                      content: `Say hi.`,
                    },
                  ],
                  model: "gpt-4",
                });
                if (completion) {
                  setOpenAIToken(formToken);
                  openAI.current = testOpenAI;
                  forceUpdate();
                }
                setLoadingAITest(false);
              }}
              loading={loadingAITest}
            >
              Enter
            </Button>
          </Center>
        </Box>
      </Modal> */}
    </>
  );
}
