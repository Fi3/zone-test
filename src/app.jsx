/* @flow */
import { withReducer } from 'recompose';
import React from 'react'; // eslint-disable-line no-unused-vars
import {map, splitEvery, concat, repeat, length, mergeAll, assoc, take, append} from 'ramda';
import theMovieDb from 'themoviedb-javascript-library';

// UTILS --section
const getPosterUrl = (path: string): PosterUrl => `https://image.tmdb.org/t/p/w200/${path}`; // eslint-disable-line
const setMovieDBKey = (key: string) => theMovieDb.common.api_key = key; 
const promisify = (f, ...args) => new Promise((res, rej) => f(args, res, rej));

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

type ActionUpdateImages =
  {| +type: 'ActionUpdateImages'
  |};

type ActionUpdateMovies =
  {| +type: 'ActionUpdateMovies',
     +movies: Array<Movie>
  |};

type Action =
  | ActionUpdateTitle
  | ActionDoNothing
  | ActionUpdateCredentials
  | ActionUpdateControl
  | ActionUpdateImages
  | ActionUpdateMovies

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

const updateImages = (): ActionUpdateImages => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionUpdateImages',
  };
};

const updateMovies = (movies: Array<Movie>): ActionUpdateMovies => { // eslint-disable-line no-unused-vars
  return {
    type: 'ActionUpdateMovies',
    movies,
  };
};

const reducer = (state: Model, action: Action): Model => {
  console.log(state, action); // eslint-disable-line
  action = controller(state.controlState, action);
  console.log(state, action); // eslint-disable-line
  if (typeof state === 'undefined') {
    return initialState;
  }

  switch (action.type) {
  case 'ActionUpdateTitle': {
    return {...state, title: action.title};
  }

  case 'ActionUpdateCredentials': {
    setMovieDBKey(action.credentials);
    const checkCredentials = () => true;
    const isValid = checkCredentials();
    return {
      ...state
      , credentials: action.credentials
      , controlState: {...state.controlState, credentialAreValid: isValid, hasCredential: true}
    };
  }

  case 'ActionDoNothing': {
    return state;
  }

  case 'ActionUpdateControl': {
    return {...state, controlState: action.control};
  }

  case 'ActionUpdateImages': {
    return {...state};
  }

  case 'ActionUpdateMovies': {
    return {...state, movies: action.movies};
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
  {| +title: string,
     +genres: Array<string>,
     +poster: PosterUrl,       // eslint-disable-line
     +rating: number,
     +isSelected: boolean,
  |} | 'nullMovie'

const testMovie : Movie =
  { title: 'TITLE'
  , genres: ['Genere']
  , poster: 'noUrl'
  , rating: 6
  , isSelected: true
  };

const nullMovie : Movie = 'nullMovie';

type ActiveDrop = 'gen' | 'rating' | ''

type Model =
  {| +title: string,
     +movies: Array<Movie>,
     +isMobile: boolean,
     +credentials: string,
     +controlState: ControlState,
     +activeDrop: ActiveDrop,
     +filterdGeneres: Array<string>,
     +filterdRatings: Array<number>,
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
const ShowTitle = ({title}) => <h1>{title}</h1>; // eslint-disable-line
const ChangeTitle = ({dispatch, control}) => // eslint-disable-line
  <button
    onClick={() => dispatch(udpateTitle('cani'))}
  >
    Change Title
  </button>;

const LogInForm = ({error, dispatch, store}: {error:string, dispatch: (any) => any, store: Model}) => { // eslint-disable-line no-unused-vars
  const state = {apiKey: ''};
  const doLogin = async () => {
    await dispatch(udpateCredentials(state.apiKey));
    fetchMovies(store, dispatch);
  };
  const onReturn = (e) => {
    if (e.keyCode === 13 && state.apiKey !== '') {
      doLogin();
    }
  }; 
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
            <input
              class="input is-light"
              type="text"
              placeholder="MovieDB API key..."
              onInput={ (e) => state.apiKey = e.target.value }
              onKeyDown={ (e) => onReturn(e) }>
            </input>
            <p class="help is-danger">{error}</p>
            <button class="button is-light" onClick={() => doLogin()}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = ({isMobile}: {isMobile: boolean}) => { // eslint-disable-line no-unused-vars
  const cl = isMobile
    ? 'hero is-light is-bold is-medium'
    : 'hero is-light is-bold';
  return(
    <section class={cl}>
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-3">
            Movie Explorer
          </h1>
          <h2 class="subtitle is-3">
            Find what to watch this night
          </h2>
        </div>
      </div>
    </section>
  );
};

const MovieBox = ({movie}: {movie: Movie}) => { // eslint-disable-line no-unused-vars
  return(
    <div class='column'>
      { movie !== 'nullMovie'
        ? <div class='box has-text-centered'>
           <h1 class='title is-5'>{movie.title}</h1>
           <img src={movie.poster} height='300' width='200' />
           <p><b>Generes:</b> {length(movie.genres) > 3 ? append(' ...', take(2, movie.genres)) : movie.genres}</p>
           <p><b>Rating:</b> {movie.rating} / 10</p>
         </div>
        : <div></div>
      }
    </div>
  );
};


const MovieExplorer = ({movies}: {movies: Array<Movie>}) => { // eslint-disable-line no-unused-vars
  // it render 5 column in any device but mobile
  // it render (len movies) / 5 row in any device but mobile it render (len movies) rows on mobile
  return(
    map(
      (subMovieList) => {
        return (
          <div class="columns is-desktop" style={{marginLeft: '40px', marginRight: '40px'}}>
            {map(
              (movie) => MovieBox({movie: movie})
              , subMovieList
            )}
          </div>
        );}
      , map( (x) => concat(x, repeat(nullMovie, 4 - length(x))), splitEvery(4, movies))
    )
  );
};

const FilterBox = ( // eslint-disable-line no-unused-vars
  {genres, ratings, activeDrop, filterdGeneres, filterdRatings}: 
  {
    genres: Array<string>
    , ratings: Array<number>
    , activeDrop: ActiveDrop
    , filterdGeneres: Array<string>
    , filterdRatings: Array<number>
  }) => {
  const genresClass =
    activeDrop === 'gen'
      ? 'dropdown is-active'
      : 'dropdown';
  const ratingClass =
    activeDrop === 'rating'
      ? 'dropdown is-active'
      : 'dropdown';
  return(
    <div class='section' style={{marginLeft: '40px', marginRight: '40px'}}>
      <div class="title is-4">
        Filter
      </div>
      <div>
        <div class={genresClass}>
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
              <span>Generes</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              {map(
                (genere) => {
                  return(
                    <a href="#" class="dropdown-item">
                      {genere}
                    </a>);}
                , genres)
              }
            </div>
          </div>
        </div>
        {map(
          (genre) => {
            return(
              <a class="button is-success is-outlined" style={{marginLeft: '10px'}}>
                <span>{genre}</span>
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </a>
            );}
          , filterdGeneres)
        }
      </div>
      <div>
        <div class={ratingClass}>
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
              <span>Rating</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              {map(
                (rating) => {
                  return(
                    <a href="#" class="dropdown-item">
                      {rating}
                    </a>);}
                , ratings)
              }
            </div>
          </div>
          {map(
            (rating) => {
              return(
                <a class="button is-success is-outlined" style={{marginLeft: '10px'}}>
                  <span>{rating}</span>
                  <span class="icon is-small">
                    <i class="fas fa-times"></i>
                  </span>
                </a>
              );}
            , filterdRatings)
          }
        </div>
      </div>
    </div>
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
    activeDrop: '',
    filterdGeneres: ['ciao'],
    filterdRatings: [2,3],
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
      ? LogInForm({error: logInError, dispatch: dispatch, store})
      : <div>
        {
          [
            FilterBox({
                genres: ['a','s','d','f']
              , ratings: [1,2,3,4], activeDrop: store.activeDrop
              , filterdGeneres: store.filterdGeneres
              , filterdRatings: store.filterdRatings
            })
            , MovieExplorer({movies: store.movies})
          ]
        }
       </div>;
  return <div class='bd-main'><Hero isMobile={store.isMobile}/>{view}</div>;
  });


////

const fetchMovies = async(state: Model, dispatch) => {
  const movieMapper = (result, genres) => map(
    (m) => { 
             return { title: m.title.split(':')[0]
                    , genres: map((id) => genres[id] + ' ', m.genre_ids)
                    , poster: getPosterUrl(m.poster_path)
                    , rating: m.vote_average
                    , isSelected: false
                    };
           }, result.results);
  try {
    const genres = mergeAll(map( (x) => assoc(x.id, x.name, {})
                                , JSON.parse(await promisify(theMovieDb.genres.getMovieList, [{}])).genres));
    const nowPlaying = movieMapper(JSON.parse(await promisify(theMovieDb.movies.getNowPlaying, [{}])), genres);
    dispatch(updateMovies(nowPlaying));
  }
  catch(e) {
    if (e.status_code === 7) {
    dispatch(udpateControl({...state.controlState, credentialAreValid: false}));
    }
  }
}; 
