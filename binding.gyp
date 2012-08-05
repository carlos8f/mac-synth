{
  'targets': [
    {
      'target_name': 'macsynth',
      'include_dirs': [
        'src'
      ],
      'sources': [
        'src/macsynth.cpp'
      ],
      'conditions': [
        ['OS=="linux"',
          {
            'cflags_cc!': [
              '-fno-exceptions'
            ],
            'defines': [
              '__LINUX_ALSASEQ__'
            ],
            'link_settings': {
              'libraries': [
                '-lasound',
                '-lpthread',
              ]
            }
          }
        ],
        ['OS=="mac"',
          {
            'defines': [
              '__MACOSX_CORE__'
            ],
            'xcode_settings': {
              'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
            },
            'link_settings': {
              'libraries': [
                'AudioUnit.framework',
                'AudioToolbox.framework',
                'CoreMIDI.framework',
                'CoreAudio.framework',
                'CoreServices.framework',
                'CoreFoundation.framework',
              ],
            }
          }
        ],
        ['OS=="win"',
          {
            'defines': [
              '__WINDOWS_MM__'
            ],
            'link_settings': {
              'libraries': [
                '-lwinmm.lib'
              ],
            }
          }
        ]
      ]
    }
  ]
}
