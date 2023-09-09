/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Modal,
  Box,
  Center,
  Button,
  Text,
  ActionIcon,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import { randomId, useForceUpdate } from "@mantine/hooks";
import { useRef, useState } from "react";
import { Message } from ".";
import { IconMicrophone, IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { getAIAudioTranscription } from "./gen-utils";

export default function TranscribeAudio(props: {
  active: boolean;
  onClose: () => void;
  onTranscription: (messages: Message[]) => void;
}) {
  const forceUpdate = useForceUpdate();

  const recorder = useRef<MediaRecorder>();
  const audioChunks = useRef<Blob[]>([]);
  const [loading, setLoading] = useState(false);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        // Create a MediaRecorder instance to record audio
        const mediaRecorder = new MediaRecorder(stream);

        // Event handler when data is available (audio chunk is recorded)
        mediaRecorder.ondataavailable = function (event) {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.start();

        mediaRecorder.onstop = function () {
          finishRecording(new Blob(audioChunks.current, { type: "audio/wav" }));
        };

        recorder.current = mediaRecorder;
        forceUpdate();
      });
  };
  const finishRecording = async (audioBlob: Blob) => {
    setLoading(true);

    // Release the microphone
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    recorder.current = undefined;
    audioChunks.current = [];
    forceUpdate();

    const audioPlayer = document.getElementById('audioPlayer');
    
    const audioUrl = URL.createObjectURL(audioBlob);
    // @ts-ignore
    audioPlayer.src = audioUrl; // Set the audio source
    // @ts-ignore
    audioPlayer.play(); // Play the audio

    // Transcribe audio
    const text = await getAIAudioTranscription(audioBlob);

    // Parse text into messages
    console.log(`Raw transcription:\n${text}`);
    const matches = [
      ...text.matchAll(
        /(?<=\W|^)(?:Her|Him|Them|Me)(?:,|\.|;|\?|!| )(.*?)(?=(?<=\W|^)(?:Her|Him|Them|Me)(?:,|\.|;|\?|!| )|$)/gim
      ),
    ];

    const messages: Message[] = [];
    for (const match of matches) {
      if(match[1].trim().length === 0) { continue; }
      messages.push({
        id: randomId(),
        source: match[0].trim().toLowerCase().startsWith("me") ? "YOU" : "THEM",
        text: match[1].trim(),
      });
    }

    // Add messages to conversation
    props.onTranscription(messages);
    props.onClose();
    setLoading(false);
  };

  return (
    <Modal
      opened={props.active}
      onClose={props.onClose}
      title={
        <Group spacing={4}>
          <ActionIcon color="dark" variant="transparent" sx={{ cursor: 'default' }}>
            <IconMicrophone size="1.2rem" />
          </ActionIcon>
          <Text fz="xl" fw="500">
            Transcribe Convo from Audio
          </Text>
        </Group>
      }
      sx={{ position: "relative" }}
    >
      <LoadingOverlay visible={loading} />
      <Text fz={14} ta="center">
        Read out your conversation to easily transcribe it.
      </Text>
      <Text fz={11} ta="center" fs="italic" pt={5}>
        Begin with the words "me" when reading your texts and "her", "him", or
        "them" when reading the other person's texts.
      </Text>
      <Box mt="sm">
        <Center>
          {recorder.current?.state === "recording" ? (
            <Button
              size="xs"
              variant="outline"
              onClick={async () => {
                recorder.current?.stop();
              }}
              rightIcon={<IconPlayerStopFilled size="1.0rem" />}
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              size="xs"
              variant="outline"
              onClick={async () => {
                startRecording();
              }}
              rightIcon={<IconPlayerPlayFilled size="1.0rem" />}
            >
              Start Recording
            </Button>
          )}
          <audio id="audioPlayer" controls></audio>
        </Center>
      </Box>
    </Modal>
  );
}
