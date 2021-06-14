type helpProps = {
  mobile: boolean;
  toggleHelp: Function;
};

export const HelpScreen = ({ mobile, toggleHelp }: helpProps) => {
  return (
    <div className="helpScreen" onClick={() => toggleHelp()}>
      {mobile ? (
        <div className="mobileHelpTextContainer">
          <h1>FLOW</h1>
          <p>
            Flow is an interactive ambient music generator. You can play with it
            to create your own music, or set it to evolve and let it create
            random, continually changing music for you.
          </p>
          <h3>Here's how it works:</h3>
          <p>
            Each colored circle in the middle represents an instrument. You can
            select an instrument by tapping its corresponding color at the top
            of the screen.
            <br />
            If an instrument is selected you'll be able to turn it on and of,
            and you'll see two sliders: one controlling the instrument's volume,
            and the other controlling how often the instrument will play.
          </p>
          <p>On the right there are some more controls:</p>
          <ul>
            <li>
              <b>PLAY:</b> With this button you can pause and restart Flow.
            </li>
            <li>
              <b>HELP (?) :</b> You obviously already found this one
            </li>
            <li>
              <b>CHORDS:</b> Here you can change the chords Flow plays. After
              every circle Flow completes (representing 8 beats), it will go to
              the next chord in the progression. The sounds will automatically
              change to fit the next chord. If Flow is in evolve-mode, these
              chords will randomly change as well, giving even more variance to
              the music!
            </li>
            <li>
              <b>EVOLVE:</b> Click this to start the <i>EVOLVE</i> mode: if Flow
              is evolving, all the controls will slowly move around, creating a
              continuously changing piece of music that will be different every
              time.
            </li>
          </ul>
          <div className="closeButton" onClick={() => toggleHelp()}>
            close
          </div>
        </div>
      ) : (
        <div className="helpTextContainer">
          <h1>FLOW</h1>
          <p>
            Flow is an interactive ambient music generator. You can play with it
            to create your own music, or set it to evolve and let it create
            random, continually changing music for you.
          </p>
          <h3>Here's how it works:</h3>
          <p>
            Each colored circle in the middle represents an instrument. You can
            turn these instruments on and off by clicking on their respective
            colors on the left and right side of the screen. On the left you'll
            find melodic instrument, on the right percussive.
            <br />
            Next to each instrument there are two sliders: one controlling the
            instrument's volume, and the other controlling how often the
            instrument will play.
          </p>
          <p>On the bottom right there are some more controls:</p>
          <ul>
            <li>
              <b>HELP (?) :</b> You obviously already found this one
            </li>
            <li>
              <b>EVOLVE:</b> Click this to start the EVOLVE mode: if Flow is
              evolving, all the controls will slowly move around, creating a
              continuously changing piece of music that will be different every
              time.
            </li>
            <li>
              <b>FX:</b> Here you can add different types of noise to the music,
              to give it some extra ambience or mood.
            </li>
            <li>
              <b>PLAY:</b> With this button you can pause and restart Flow.
            </li>
          </ul>
          <p>
            On the bottom left there is the option to change the current chord
            progression. After every circle Flow completes (representing 8
            beats), it will go to the next chord in the progression. The sounds
            will automatically change to fit the next chord. If Flow is in
            evolve-mode, these chords will randomly change as well, giving even
            more variance to the music!
          </p>
          <div className="closeButton" onClick={() => toggleHelp()}>
            close
          </div>
        </div>
      )}
    </div>
  );
};
export default HelpScreen;
