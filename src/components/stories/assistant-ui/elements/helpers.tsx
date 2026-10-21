import type { PropsWithChildren, ReactElement } from "react";

export function MarkdownHeading({ children }: PropsWithChildren): ReactElement {
  return <h2 data-testid="MarkdownHeading">{children}</h2>;
}
import { useState, type JSX } from "react";
import { Badge } from "../../../Badge.js";
import { Button } from "../../../Button.js";
import { AudioPlayer } from "../../../assistant-ui/elements/AudioPlayer.js";
import { ImageActions } from "../../../assistant-ui/elements/Image.js";
import audio from "./fixtures/sample.wav?url";
import actionImage from "./fixtures/sample.svg?url";
import { Composer } from "../../../assistant-ui/elements/Composer.js";
import { ComposerActions } from "../../../assistant-ui/elements/ComposerActions.js";
import { ComposerAttachButton } from "../../../assistant-ui/elements/ComposerAttachButton.js";
import { ComposerAttachmentChip } from "../../../assistant-ui/elements/ComposerAttachmentChip.js";
import { ComposerAttachments } from "../../../assistant-ui/elements/ComposerAttachments.js";
import { ComposerBar } from "../../../assistant-ui/elements/ComposerBar.js";
import { ComposerCommandItem } from "../../../assistant-ui/elements/ComposerCommandItem.js";
import { ComposerContext } from "../../../assistant-ui/elements/ComposerContext.js";
import { ComposerInput } from "../../../assistant-ui/elements/ComposerInput.js";
import { ComposerMenu } from "../../../assistant-ui/elements/ComposerMenu.js";
import { ComposerPersonItem } from "../../../assistant-ui/elements/ComposerPersonItem.js";
import { ComposerSend } from "../../../assistant-ui/elements/ComposerSend.js";
import { ComposerToolbar } from "../../../assistant-ui/elements/ComposerToolbar.js";
import { ComposerVoice } from "../../../assistant-ui/elements/ComposerVoice.js";
import { ComposerVoiceButton } from "../../../assistant-ui/elements/ComposerVoiceButton.js";
import { matchSlashCommands } from "../../../assistant-ui/utils/matchSlashCommands.js";
import { matchMentionPeople } from "../../../assistant-ui/utils/matchMentionPeople.js";
import { applyMention } from "../../../assistant-ui/utils/applyMention.js";
import {
  fixture_composerAttachment,
  fixture_composerAudioLevels,
  fixture_composerCommands,
  fixture_composerPeople,
  fixture_composerUsage,
} from "./fixtures.js";

interface IComposerExampleProps {
  defaultValue?: string;
  onSubmit?: (value: string) => void;
}

export function ComposerExample({ defaultValue = "", onSubmit }: IComposerExampleProps): JSX.Element {
  const [value, setValue] = useState(defaultValue);
  const [isRecording, setIsRecording] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [sentValue, setSentValue] = useState("");
  const commands = matchSlashCommands(value, fixture_composerCommands);
  const people = matchMentionPeople(value, fixture_composerPeople);
  const send = () => {
    if (!value.trim()) return;
    onSubmit?.(value);
    setSentValue(value);
    setValue("");
  };

  return (
    <Composer>
      <ComposerMenu open={commands.length > 0 || people.length > 0}>
        {commands.map((command) => (
          <ComposerCommandItem
            key={command.name}
            command={command}
            active={false}
            onClick={() => setValue(`/${command.name} `)}
          />
        ))}
        {people.map((person) => (
          <ComposerPersonItem
            key={person.name}
            person={person}
            active={false}
            onClick={() => setValue(applyMention(value, person.name))}
          />
        ))}
      </ComposerMenu>
      <ComposerBar>
        {hasAttachment ? (
          <ComposerAttachments>
            <ComposerAttachmentChip attachment={fixture_composerAttachment} onRemove={() => setHasAttachment(false)} />
          </ComposerAttachments>
        ) : null}
        {isRecording ? (
          <ComposerVoice recording seconds={7} audioLevels={fixture_composerAudioLevels} />
        ) : (
          <ComposerInput
            aria-label="Message"
            placeholder="Message"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            onSubmit={send}
          />
        )}
        <ComposerToolbar>
          <ComposerActions>
            <ComposerAttachButton onClick={() => setHasAttachment(true)} />
            <ComposerVoiceButton active={isRecording} onClick={() => setIsRecording((current) => !current)} />
            <ComposerContext usage={fixture_composerUsage} />
          </ComposerActions>
          <ComposerSend streaming={false} idle={!value.trim() || isRecording} onClick={send} />
        </ComposerToolbar>
      </ComposerBar>
      {sentValue ? <Badge>{`Sent: ${sentValue}`}</Badge> : null}
    </Composer>
  );
}

export function AudioSourceFixture(): JSX.Element {
  const [source, setSource] = useState("data:audio/mpeg;base64,broken");
  return (
    <div>
      <AudioPlayer
        src={source}
        artwork="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      />
      <Button onClick={() => setSource(audio)}>Load valid audio</Button>
      <Button onClick={() => setSource(`${audio}#second`)}>Change audio source</Button>
    </div>
  );
}

interface IImageActionSourceFixtureProps {
  onRegenerate?: () => Promise<void>;
}

export function ImageActionSourceFixture({ onRegenerate }: IImageActionSourceFixtureProps): JSX.Element {
  const [isReplacement, setIsReplacement] = useState(false);
  const imageURL = new URL(actionImage, import.meta.url).href;
  const replacementImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><text x="20" y="90">Replacement image</text></svg>')}`;
  return (
    <div>
      <ImageActions
        part={{ type: "image", image: isReplacement ? replacementImage : imageURL }}
        onRegenerate={onRegenerate}
      />
      <Button onClick={() => setIsReplacement(true)}>Replace image</Button>
    </div>
  );
}
