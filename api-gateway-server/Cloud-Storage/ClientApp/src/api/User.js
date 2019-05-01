import $http from './$http';

class User {
	static current_user = {};

	static async checkAccessToken(access_token){
		$http.defaults.headers.Authorization = `Bearer ${access_token}`;
		try{
			return (await $http.get('user')).data;
		}
		catch (e) {
			return false;
		}
	}

	static async login(email, password){
		return (await $http.post('login', {email, password})).data;
    }
    
    static async register(name, email, password){
		return (await $http.post('register', {name, email, password})).data;
	}

	static setUser(user, access_token = null){
		this.current_user = user;
		if(!user.accessToken && access_token)
			this.current_user.accessToken = access_token;
		if(access_token){
			$http.defaults.headers.Authorization = `Bearer ${access_token}`;
			localStorage.setItem('access_token', access_token);
		}
	}

	static  getUser(){
		return this.current_user;
	}

	static async logout(){
		return (await $http.post('logout')).data;
	}
}

export default User;
