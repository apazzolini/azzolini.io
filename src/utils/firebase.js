import Firebase from 'firebase';
import config from 'config';

export function firebaseInit() {
  // Authenticate with Firebase
  const ref = new Firebase(config.get('firebase.path'));
  ref.authWithCustomToken(config.get('firebase.apiKey'), (error) => {
    if (error) {
      console.error('Terminating startup due to bad Firebase ref');
      process.exit(1);
    }

    // Conveniently access the root ref
    Firebase.root = ref;
  });
}