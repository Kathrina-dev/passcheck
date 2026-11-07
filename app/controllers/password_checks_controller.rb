class PasswordChecksController < ApplicationController
  def create
    password = params[:password].to_s

    compromised = PasswordChecker.compromised?(password)

    render json: {
      compromised: compromised
    }
  end
end