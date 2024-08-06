import React, { useContext, useState } from 'react';
import { View, Text,  Alert, Image } from "react-native";
import { Button,  TextInput  } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Style from "./Style";
import { authApi, endpoints } from '../../configs/APIs';
import APIs from '../../configs/APIs'; // Thêm import này
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from '@env';
import { MyDispatchContext } from '../../configs/Contexts';
import LoginStyle from '../../styles/LoginStyle';

const Login =() => {
    const dispatch =useContext(MyDispatchContext);
    const [user, setUser] = useState({});
    const fields = [{
        "label": "Tên đăng nhập",
        "icon": "account",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "icon": "eye",
        "name": "password",
        "secureTextEntry": true
    }];
    const updateSate = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    
    const DangNhapClick = async ()=> {
        try {
            const payload = {
                ...user,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'grant_type': 'password'
            };

            // Chuyển đổi payload thành chuỗi URL-encoded
            const urlEncodedPayload = new URLSearchParams(payload).toString();

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            let res = await APIs.post(endpoints['login'], urlEncodedPayload, { headers });
            console.info(res.data);
            
            await AsyncStorage.setItem("token", res.data.access_token);

            setTimeout(async() => {
                let user = await authApi(res.data.access_token).get(endpoints['current-user']);
                console.log(user.data);
                dispatch({
                    "type":"login",
                    "payload":user.data
                })
            }, 1000);
            if (res.status === 200) {                
                // Alert.alert('Đăng nhập thành công', 'Chào mừng bạn quay lại');
                // Lưu token hoặc chuyển hướng sang trang khác tại đây
                navigation.navigate('MyTab');
            } else {
                Alert.alert('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không chính xác.');
            }                     
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            Alert.alert('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không chính xác.');
        }
    };
           
    const DangKiClick = () => {
        // Xử lý khi bấm nút Đăng ký
        navigation.navigate('Register')
        console.log('Đăng ký');
    };

    return (
        
        <View style={LoginStyle.container}>
            <View>
            <Image style={LoginStyle.logo} source={{uri: 'https://img2.gratispng.com/20180320/cbw/kisspng-computer-icons-payment-income-finance-size-salary-icon-5ab0ff64d51e22.7800877615215491568729.jpg'}}/>
            </View>
            <Text style={LoginStyle.title}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>
            <View style={[LoginStyle.input]}>
                {fields.map(c => <TextInput style={LoginStyle.inputElement} secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}
            </View>
            <View style={Style.button}>
                <Button style={LoginStyle.buttonElement}  icon="account" loading={loading} mode="contained" onPress={DangNhapClick}>ĐĂNG NHẬP</Button>
                <Button style={LoginStyle.buttonElement} icon="account" loading={loading} mode="contained" onPress={DangKiClick}>ĐĂNG kÝ</Button>
            </View>
    </View>
       
    );
};

export default Login;
