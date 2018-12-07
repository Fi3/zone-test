/* @flow */
import { withReducer } from 'recompose';
import React from 'react'; // eslint-disable-line no-unused-vars

// UTILS --section
const getPosterUrl = (title: string): PosterUrl => `https//:${title}.com`; // eslint-disable-line

// UPDATE --section
type ActionUpdateTitle =
  {| +type: 'ActionUpdateTitle',
     +title: string,
  |};

type ActionDoNothing =
  {| +type: 'ActionDoNothing',
  |};

type ActionUpdateCredentials =
  {| +type: 'ActionUpdateCredentials',
     +credentials: string,
  |};

type ActionUpdateControl =
  {| +type: 'ActionUpdateControl',
     +control: ControlState,
  |};

type Action =
  | ActionUpdateTitle
  | ActionDoNothing
  | ActionUpdateCredentials
  | ActionUpdateControl

const udpateTitle = (title: string): ActionUpdateTitle => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionUpdateTitle',
    title,
  };
};

const doNothing = (): ActionDoNothing => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionDoNothing',
  };
};

const udpateCredentials = (credentials: string): ActionUpdateCredentials => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionUpdateCredentials',
    credentials,
  };
};

const udpateControl = (control: ControlState): ActionUpdateControl => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionUpdateControl',
    control,
  };
};

const reducer = (state: Model, action: Action): Model => {
  if (typeof state === 'undefined') {
    return initialState;
  }

  switch (action.type) {
  case 'ActionUpdateTitle': {
    return {...state, title: action.title};
  }

  case 'ActionUpdateCredentials': {
    return {...state, credentials: action.credentials};
  }

  case 'ActionDoNothing': {
    return state;
  }

  case 'ActionUpdateControl': {
    return {...state, controlState: action.control};
  }

  // trick to have flow errors when we do not handle all the action types
  default:
    (action: empty);
    return state;
  }
};

// BOOTSTRAP THE APP --section
opaque type PosterUrl = string; // eslint-disable-line

type Movie =
  {| +tile: string,
     +genres: Array<string>,
     +poster: PosterUrl,       // eslint-disable-line
     +rating: number,
     +isSelected: boolean,
  |}

type Model =
  {| +title: string,
     +movies: Array<Movie>,
     +isMobile: boolean,
     +credentials: string,
     +controlState: ControlState,
  |}

// CONTROL STATE

type ControlState =
  {| +hasCredential: boolean,
     +credentialAreValid: boolean,
     +isLoadingMovieList: boolean,
     +isLoadingGeneres: boolean,
     +hasConnetion: boolean,
  |}


const controller = (controlState: ControlState, action: Action): Action => {
  if (typeof controlState === 'undefined') {
    return doNothing();
  }
  if (!controlState.hasCredential) {
    switch (action.type) {
    case 'ActionUpdateCredentials': {
      return action;
    }}
    return doNothing();
  }
  if (controlState.hasCredential && !controlState.credentialAreValid) {
    switch (action.type) {
    case 'ActionUpdateCredentials': {
      return action;
    }}
    return doNothing();
  }
  if (controlState.isLoadingMovieList || controlState.isLoadingGeneres) {
    return doNothing();
  }
  if (!controlState.isLoadingMovieList
      && !controlState.isLoadingGeneres
      && controlState.hasCredential
      && controlState.credentialAreValid
     ) {
    return action;
  }
  return doNothing(); // TODO emit message invalid state please reload the page
};


// VIEWS --section
const ShowTitle = ({title}) => <h1>{title}</h1>;
const ChangeTitle = ({dispatch, control}) =>
  <button
    onClick={() => dispatch(controller(control, udpateTitle('cani')))}
  >
    Change Title
  </button>;

const LogInForm = ({error}: {error:string, isMobile: boolean}) => { // eslint-disable-line no-unused-vars
  return(
    <div class="section">
      <div class="container" style={{
            borderStyle: 'solid'
          , borderWidth: '1px'
          , borderColor: 'rgba(0,0,0,0.2)'
          , padding: '10px'
        }}>
        <div class="label">
          <div classs="control">
            <label class="label">API Key</label>
            <p class='help'>You need a <a>MovieDB API Key</a> in order to access movies' data</p>
            <input class="input is-light" type="text" placeholder="MovieDB API key..."></input>
            <p class="help is-danger">{error}</p>
            <button class="button is-light">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = ({isMobile}: {isMobile: boolean}) => {
  const cl = isMobile
    ? 'hero is-light is-bold is-medium'
    : 'hero is-light is-bold';
  return(
    <section class={cl}>
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Movie Explore
          </h1>
          <h2 class="subtitle">
            Find what to watch this night
          </h2>
        </div>
      </div>
    </section>
  );
};


// BOOTSTRAP
const intialControlState =
  { hasCredential: false,
    credentialAreValid: true,
    isLoadingMovieList: false,
    isLoadingGeneres: false,
    hasConnetion: true,
  };

const initialState: Model =
  { title: 'ciao',
    movies: [],
    isMobile: false,
    credentials: '',
    controlState: intialControlState,
  };

const enhance = withReducer('store', 'dispatch', reducer, initialState);
export const App = enhance(({store, dispatch}) => { // eslint-disable-line no-unused-vars
    const cs = store.controlState;
    const logInError = !cs.credentialAreValid 
      ? 'Invalid API Key' 
      : !cs.hasConnetion 
        ? 'Check internet connection' 
        : '';
    const view = !cs.hasCredential || !cs.credentialAreValid
      ? LogInForm({error: logInError})
      : <div>
         {ShowTitle({title: store.title})}
         {ChangeTitle({dispatch: dispatch, control: cs})}
       </div>;
  return <div class='bd-main'><Hero isMobile={store.isMobile}/>{view}</div>;
  }
);
