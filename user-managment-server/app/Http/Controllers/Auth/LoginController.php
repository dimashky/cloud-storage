<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Symfony\Component\HttpFoundation\Request;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    public function loginAPI(Request $request) {
        try {
            if(! \Auth::attempt($request->only('email', 'password'))) {
                throw new \Exception("invalid email or password or your account is blocked");
            }
            $user = \Auth::user();
            $user->accessToken = $user->createToken('CloudStorage')->accessToken;
            return $user;
        } catch (\Exception $e) {
            return $this->response('failed, '.$e->getMessage(), null, 400);
        }
    }
}
