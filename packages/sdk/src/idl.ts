/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sss_token.json`.
 */
export type SssToken = {
  "address": "8YkrKuinMsuBwds8zU2unhSvV2oYqjgXyp2TCiTLYPiy",
  "metadata": {
    "name": "sssToken",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "addToBlacklist",
      "docs": [
        "Add an address to the blacklist (SSS-2 only)"
      ],
      "discriminator": [
        90,
        115,
        98,
        231,
        173,
        119,
        117,
        176
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "blacklister",
          "writable": true,
          "signer": true
        },
        {
          "name": "blacklistEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  97,
                  99,
                  107,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "stablecoinConfig"
              },
              {
                "kind": "account",
                "path": "address"
              }
            ]
          }
        },
        {
          "name": "address"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "burn",
      "docs": [
        "Burn tokens from an account"
      ],
      "discriminator": [
        116,
        110,
        29,
        56,
        107,
        219,
        42,
        93
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mintAccount"
              }
            ]
          }
        },
        {
          "name": "burner",
          "signer": true
        },
        {
          "name": "mintAccount",
          "writable": true
        },
        {
          "name": "source",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "freezeAccount",
      "docs": [
        "Freeze an account (prevent transfers)"
      ],
      "discriminator": [
        253,
        75,
        82,
        133,
        167,
        238,
        43,
        130
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize a new stablecoin with SSS-1 or SSS-2 preset"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "masterAuthority",
          "docs": [
            "Master authority (will have all roles initially)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Mint account (will be created by Token-2022)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "stablecoinConfig",
          "docs": [
            "Stablecoin configuration PDA"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token-2022 program"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Rent sysvar"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializeParams"
            }
          }
        }
      ]
    },
    {
      "name": "mint",
      "docs": [
        "Mint tokens to a destination account"
      ],
      "discriminator": [
        51,
        57,
        225,
        47,
        182,
        146,
        137,
        166
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "docs": [
            "Stablecoin configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mintAccount"
              }
            ]
          }
        },
        {
          "name": "minter",
          "docs": [
            "Minter authority or master authority"
          ],
          "signer": true
        },
        {
          "name": "minterConfig",
          "docs": [
            "Minter config (optional - only needed if not master)"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "stablecoinConfig"
              },
              {
                "kind": "account",
                "path": "minter"
              }
            ]
          }
        },
        {
          "name": "mintAccount",
          "docs": [
            "Mint account"
          ],
          "writable": true
        },
        {
          "name": "destination",
          "docs": [
            "Destination token account"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pause",
      "docs": [
        "Pause all token operations"
      ],
      "discriminator": [
        211,
        22,
        221,
        251,
        74,
        121,
        193,
        47
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "removeFromBlacklist",
      "docs": [
        "Remove an address from the blacklist (SSS-2 only)"
      ],
      "discriminator": [
        47,
        105,
        20,
        10,
        165,
        168,
        203,
        219
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "blacklister",
          "writable": true,
          "signer": true
        },
        {
          "name": "blacklistEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  97,
                  99,
                  107,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "stablecoinConfig"
              },
              {
                "kind": "account",
                "path": "address"
              }
            ]
          }
        },
        {
          "name": "address"
        }
      ],
      "args": []
    },
    {
      "name": "seize",
      "docs": [
        "Seize tokens from a blacklisted account (SSS-2 only)"
      ],
      "discriminator": [
        129,
        159,
        143,
        31,
        161,
        224,
        241,
        84
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mintAccount"
              }
            ]
          }
        },
        {
          "name": "seizer",
          "signer": true
        },
        {
          "name": "mintAccount"
        },
        {
          "name": "source",
          "docs": [
            "Account to seize from (must be blacklisted)"
          ],
          "writable": true
        },
        {
          "name": "blacklistEntry",
          "docs": [
            "Blacklist entry proving the account is blacklisted"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  97,
                  99,
                  107,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "stablecoinConfig"
              },
              {
                "kind": "account",
                "path": "source.owner"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "docs": [
            "Treasury account to receive seized tokens"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "thawAccount",
      "docs": [
        "Thaw a frozen account (allow transfers)"
      ],
      "discriminator": [
        115,
        152,
        79,
        213,
        213,
        169,
        184,
        35
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": []
    },
    {
      "name": "transferAuthority",
      "docs": [
        "Transfer master authority to a new address"
      ],
      "discriminator": [
        48,
        169,
        76,
        72,
        229,
        180,
        55,
        161
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "currentAuthority",
          "signer": true
        },
        {
          "name": "newAuthority"
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "unpause",
      "docs": [
        "Unpause token operations"
      ],
      "discriminator": [
        169,
        144,
        4,
        38,
        10,
        141,
        188,
        255
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updateMinter",
      "docs": [
        "Update minter authority and quota"
      ],
      "discriminator": [
        164,
        129,
        164,
        88,
        75,
        29,
        91,
        38
      ],
      "accounts": [
        {
          "name": "stablecoinConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  99,
                  111,
                  105,
                  110,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "stablecoin_config.mint",
                "account": "stablecoinConfig"
              }
            ]
          }
        },
        {
          "name": "masterAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "minterConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "stablecoinConfig"
              },
              {
                "kind": "account",
                "path": "newMinterAddress"
              }
            ]
          }
        },
        {
          "name": "newMinterAddress"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newMinter",
          "type": "pubkey"
        },
        {
          "name": "quota",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blacklistEntry",
      "discriminator": [
        218,
        179,
        231,
        40,
        141,
        25,
        168,
        189
      ]
    },
    {
      "name": "minterConfig",
      "discriminator": [
        78,
        211,
        23,
        6,
        233,
        19,
        19,
        236
      ]
    },
    {
      "name": "stablecoinConfig",
      "discriminator": [
        127,
        25,
        244,
        213,
        1,
        192,
        101,
        6
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "tokenPaused",
      "msg": "Stablecoin is currently paused. No operations allowed."
    },
    {
      "code": 6001,
      "name": "sss2NotEnabled",
      "msg": "SSS-2 features (transfer hook and permanent delegate) must be enabled for compliance operations."
    },
    {
      "code": 6002,
      "name": "minterQuotaExceeded",
      "msg": "Minter quota exceeded. Cannot mint more than allocated amount."
    },
    {
      "code": 6003,
      "name": "invalidMinter",
      "msg": "Invalid minter authority. This address is not authorized to mint."
    },
    {
      "code": 6004,
      "name": "invalidBlacklister",
      "msg": "Invalid blacklister authority. This address is not authorized to manage blacklist."
    },
    {
      "code": 6005,
      "name": "invalidPauser",
      "msg": "Invalid pauser authority. This address is not authorized to pause/unpause."
    },
    {
      "code": 6006,
      "name": "invalidSeizer",
      "msg": "Invalid seizer authority. This address is not authorized to seize funds."
    },
    {
      "code": 6007,
      "name": "notBlacklisted",
      "msg": "Account is not blacklisted. Cannot perform blacklist-specific operations."
    },
    {
      "code": 6008,
      "name": "alreadyBlacklisted",
      "msg": "Account is already blacklisted."
    },
    {
      "code": 6009,
      "name": "nameTooLong",
      "msg": "Name too long. Maximum 64 characters."
    },
    {
      "code": 6010,
      "name": "symbolTooLong",
      "msg": "Symbol too long. Maximum 16 characters."
    },
    {
      "code": 6011,
      "name": "uriTooLong",
      "msg": "URI too long. Maximum 200 characters."
    },
    {
      "code": 6012,
      "name": "blacklistReasonTooLong",
      "msg": "Blacklist reason too long. Maximum 200 characters."
    },
    {
      "code": 6013,
      "name": "invalidDecimals",
      "msg": "Invalid decimals. Must be between 0 and 9."
    },
    {
      "code": 6014,
      "name": "overflow",
      "msg": "Arithmetic overflow detected."
    },
    {
      "code": 6015,
      "name": "underflow",
      "msg": "Arithmetic underflow detected."
    }
  ],
  "types": [
    {
      "name": "blacklistEntry",
      "docs": [
        "Blacklist entry for SSS-2 compliance",
        "Seeds: [\"blacklist\", stablecoin_config.key(), address.key()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stablecoinConfig",
            "docs": [
              "The stablecoin config this entry belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "address",
            "docs": [
              "Blacklisted address"
            ],
            "type": "pubkey"
          },
          {
            "name": "reason",
            "docs": [
              "Reason for blacklisting"
            ],
            "type": "string"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp when blacklisted"
            ],
            "type": "i64"
          },
          {
            "name": "blacklister",
            "docs": [
              "Authority who blacklisted"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "initializeParams",
      "docs": [
        "Initialize parameters"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "enablePermanentDelegate",
            "type": "bool"
          },
          {
            "name": "enableTransferHook",
            "type": "bool"
          },
          {
            "name": "defaultAccountFrozen",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "minterConfig",
      "docs": [
        "Minter authority with quota tracking",
        "Seeds: [\"minter\", stablecoin_config.key(), minter_authority.key()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stablecoinConfig",
            "docs": [
              "The stablecoin config this minter belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "minter",
            "docs": [
              "Minter authority"
            ],
            "type": "pubkey"
          },
          {
            "name": "quota",
            "docs": [
              "Maximum amount this minter can mint"
            ],
            "type": "u64"
          },
          {
            "name": "minted",
            "docs": [
              "Amount already minted by this minter"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stablecoinConfig",
      "docs": [
        "Configuration PDA for the stablecoin",
        "Seeds: [\"stablecoin-config\", mint.key()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterAuthority",
            "docs": [
              "Master authority (can perform all operations)"
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "Mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Token name"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Token symbol"
            ],
            "type": "string"
          },
          {
            "name": "uri",
            "docs": [
              "Metadata URI"
            ],
            "type": "string"
          },
          {
            "name": "decimals",
            "docs": [
              "Decimals"
            ],
            "type": "u8"
          },
          {
            "name": "enablePermanentDelegate",
            "docs": [
              "Enable permanent delegate (required for SSS-2 seize)"
            ],
            "type": "bool"
          },
          {
            "name": "enableTransferHook",
            "docs": [
              "Enable transfer hook (required for SSS-2 blacklist enforcement)"
            ],
            "type": "bool"
          },
          {
            "name": "defaultAccountFrozen",
            "docs": [
              "Default state for new accounts (true = frozen by default)"
            ],
            "type": "bool"
          },
          {
            "name": "isPaused",
            "docs": [
              "Is the token currently paused?"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
