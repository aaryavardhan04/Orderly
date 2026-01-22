package com.orderly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse implements Serializable {
    private static final long serialVersionUID = -8091879091924046844L;
    private String jwt;
    private String username;
    private String role;
    private int userId;
}
