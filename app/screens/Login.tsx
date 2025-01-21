import React, {useState} from 'react';
import { View, Text } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    return (
        <View>
        <Text>Login</Text>
        </View>
    );
};

export default Login;