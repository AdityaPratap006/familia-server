import firebaseAdmin, { ServiceAccount } from 'firebase-admin';

const serviceAccountParams = <ServiceAccount>{
    type: process.env.FIREBASE_type,
    projectId: process.env.FIREBASE_projectId,
    privateKeyId: process.env.FIREBASE_privateKeyId,
    privateKey: process.env.FIREBASE_privateKey?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_clientEmail,
    clientId: process.env.FIREBASE_clientId,
    authUri: process.env.FIREBASE_authUri,
    tokenUri: process.env.FIREBASE_tokenUri,
    authProviderX509CertUrl: process.env.FIREBASE_authProviderX509CertUrl,
    clientC509CertUrl: process.env.FIREBASE_clientC509CertUrl
};

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccountParams),
});

export {
    firebaseAdmin,
}